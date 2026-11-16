import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { config } from '../../config';
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

    if (!user) {
      // Return user-friendly response even if user not found (security practice)
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a 6-digit reset code has been generated.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'This account is currently deactivated. Please contact support or your school administrator.',
      });
      return;
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in memory with 15-minute expiry
    resetOtpStore.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
      attempts: 0,
    });

    // Create a cryptographic reset token as well
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    // Dispatch real email (or simulated fallback if SMTP not configured)
    await sendPasswordResetEmail({
      to: cleanEmail,
      name: user.firstName,
      otp,
    });

    console.log(`🔑 [PASSWORD RESET OTP] Target: ${cleanEmail} -> Verification Code: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'A 6-digit password reset code has been generated.',
      email: cleanEmail,
      otp, // Exposed for immediate in-app reset / demo verification
      resetToken,
    });
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

