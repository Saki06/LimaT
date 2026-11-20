import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { prisma } from '../../config/prisma';
import { isValidEmail } from './auth.utils';
import { sendPasswordResetEmail } from '../../services/email.service';

// In-memory store for OTPs (with TTL and brute-force protection)
interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const resetOtpStore = new Map<string, OtpEntry>();

// Clean expired OTPs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of resetOtpStore.entries()) {
    if (entry.expiresAt < now) {
      resetOtpStore.delete(email);
    }
  }
}, 10 * 60 * 1000);

/**
 * 1. POST /api/auth/forgot-password
 * Initiates the password reset flow and generates a 6-digit OTP code
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        email: { equals: cleanEmail, mode: 'insensitive' },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        isActive: true,
      },
    });

    const genericResponse = {
      success: true,
      message: 'If an account exists with this email, a 6-digit reset code has been sent.',
    };

    if (!user || !user.isActive) {
      // Return identical generic response to prevent account / status enumeration (VULN-07 fix)
      res.status(200).json(genericResponse);
      return;
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in memory with 15-minute expiry
    const expiresAt = Date.now() + 15 * 60 * 1000;
    resetOtpStore.set(cleanEmail, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Dispatch email (or safe mock when MOCK_EMAIL=true)
    await sendPasswordResetEmail({
      to: cleanEmail,
      name: user.firstName,
      otp,
    });

    // Isolated local QA test fixture ONLY when both MOCK_EMAIL=true and NODE_ENV=test
    // Never exposed in HTTP responses or production logs (VULN-07 fix)
    if (process.env.MOCK_EMAIL === 'true' && process.env.NODE_ENV === 'test') {
      try {
        const fixturePath = path.join(os.tmpdir(), 'newtoz_qa_mock_otp.json');
        let existing: Record<string, { otp: string; expiresAt: number }> = {};
        if (fs.existsSync(fixturePath)) {
          existing = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
        }
        existing[cleanEmail] = { otp, expiresAt };
        fs.writeFileSync(fixturePath, JSON.stringify(existing), { encoding: 'utf-8', mode: 0o600 });
      } catch {
        // Non-fatal in test fixture write
      }
    }

    res.status(200).json(genericResponse);
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error initiating password reset.' });
  }
};

/**
 * 2. POST /api/auth/verify-reset-code
 * Verifies that the entered 6-digit OTP code is valid and unexpired
 */
export const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and 6-digit code are required.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const entry = resetOtpStore.get(cleanEmail);
    if (!entry) {
      res.status(400).json({ success: false, message: 'No active reset request found or code has expired. Please request a new code.' });
      return;
    }

    if (Date.now() > entry.expiresAt) {
      resetOtpStore.delete(cleanEmail);
      res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' });
      return;
    }

    if (entry.attempts >= 5) {
      resetOtpStore.delete(cleanEmail);
      res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new reset code.' });
      return;
    }

    if (entry.otp !== cleanOtp) {
      entry.attempts += 1;
      res.status(400).json({ success: false, message: 'Incorrect reset code. Please double check and try again.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reset code verified successfully. You may now enter your new password.',
    });
  } catch (error: any) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error verifying reset code.' });
  }
};

/**
 * 3. POST /api/auth/reset-password
 * Applies the new password after OTP verification
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ success: false, message: 'Email, reset code, and new password are required.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const passwordStr = String(newPassword).trim();

    if (passwordStr.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const entry = resetOtpStore.get(cleanEmail);
    if (!entry) {
      res.status(400).json({ success: false, message: 'No active reset request found or code expired. Please request a new code.' });
      return;
    }

    if (Date.now() > entry.expiresAt) {
      resetOtpStore.delete(cleanEmail);
      res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new code.' });
      return;
    }

    if (entry.attempts >= 5) {
      resetOtpStore.delete(cleanEmail);
      res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new code.' });
      return;
    }

    if (entry.otp !== cleanOtp) {
      entry.attempts += 1;
      res.status(400).json({ success: false, message: 'Invalid reset code.' });
      return;
    }

    // Lookup user in DB
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: cleanEmail, mode: 'insensitive' },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    // Hash the new password with bcrypt
    const passwordHash = await bcrypt.hash(passwordStr, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate the OTP
    resetOtpStore.delete(cleanEmail);

    console.log(`✅ [PASSWORD RESET SUCCESS] Password successfully updated for: ${cleanEmail}`);

    res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error while resetting password.' });
  }
};

