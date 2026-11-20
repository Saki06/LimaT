import nodemailer from 'nodemailer';
import { config } from '../config';

interface SendPasswordResetParams {
  to: string;
  name?: string;
  otp: string;
}

/**
 * Creates and returns a configured nodemailer transporter
 */
const getTransporter = () => {
  // Safety guard: Never send real emails in test mode or when MOCK_EMAIL is true
  if (process.env.MOCK_EMAIL === 'true' || process.env.NODE_ENV === 'test' || !config.smtp.user || !config.smtp.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
};

/**
 * Dispatches a password reset email with the 6-digit OTP code
 */
export const sendPasswordResetEmail = async ({
  to,
  name,
  otp,
}: SendPasswordResetParams): Promise<{ success: boolean; simulated?: boolean; error?: string }> => {
  const recipientName = name ? name.trim() : 'Learner';
  const transporter = getTransporter();

  // If SMTP is not yet configured, log to terminal for local development
  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`📨 [SIMULATED EMAIL DISPATCH - SMTP NOT CONFIGURED]`);
    console.log(`To: ${to} (${recipientName})`);
    console.log(`Subject: Your Newtoz LMS Password Reset Code`);
    console.log(`🔑 Verification Code: ${otp}`);
    console.log(`⏱️ Expiry: 15 Minutes`);
    console.log(`💡 To send real emails, set SMTP_USER and SMTP_PASS in backend/.env`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code - Newtoz LMS</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf9; margin: 0; padding: 24px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px border #e6ece8;">
    <!-- Top Brand Bar -->
    <tr>
      <td style="height: 6px; background: linear-gradient(90deg, #0d5c4d 0%, #10705e 50%, #f3b738 100%);"></td>
    </tr>

    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 16px 32px; text-align: center;">
        <h1 style="color: #0d2b26; font-size: 24px; font-weight: 800; margin: 0;">Newtoz Learning Platform</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Next-Gen Cloud Learning & Tuition System</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 0 32px 24px 32px;">
        <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 16px 0;">
          Hello <strong>${recipientName}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 20px 0;">
          We received a request to reset the password for your Newtoz LMS account. Use the following 6-digit verification code to complete the reset process:
        </p>

        <!-- Big 6-Digit OTP Box -->
        <div style="background-color: #ecf8f5; border: 2px dashed #0d5c4d; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0d5c4d; display: inline-block;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 20px; margin: 0 0 12px 0;">
          ⏱️ This verification code is valid for <strong>15 minutes</strong>.
        </p>
        <p style="font-size: 13px; color: #64748b; line-height: 20px; margin: 0;">
          🛡️ If you did not request this password reset, please ignore this email or contact your school administrator. Your account remains secure.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background-color: #f8faf9; border-top: 1px solid #e6ece8; text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          © ${new Date().getFullYear()} Newtoz LMS. All rights reserved.
        </p>
        <p style="font-size: 11px; color: #94a3b8; margin: 6px 0 0 0;">
          Automated system notification. Please do not reply directly to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `${otp} is your Newtoz LMS Password Reset Code`,
      text: `Hello ${recipientName},\n\nYour Newtoz LMS password reset verification code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: htmlContent,
    });

    console.log(`✅ [EMAIL DISPATCHED] Password reset code sent to ${to} (MessageId: ${info.messageId})`);
    return { success: true };
  } catch (err: any) {
    console.error(`❌ [EMAIL DISPATCH FAILED] Error sending to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

