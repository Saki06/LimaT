import nodemailer from 'nodemailer';
import { config } from '../config';

export const sendPasswordResetEmail = async (input: {
  to: string;
  name?: string;
  otp: string;
}): Promise<{ success: boolean; error?: string }> => {
  if (!config.smtp.user || !config.smtp.pass || !config.smtp.from) {
    return { success: false, error: 'Password reset email delivery is not configured.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });

    await transporter.sendMail({
      from: config.smtp.from,
      to: input.to,
      subject: 'Your Newtoz LMS password reset code',
      text: `Hello ${input.name?.trim() || 'Learner'},\n\nYour password reset code is ${input.otp}. It expires in 15 minutes.`,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email delivery failed.';
    console.error('Password reset email delivery failed:', message);
    return { success: false, error: 'Password reset email delivery failed.' };
  }
};

export const sendParentLinkVerificationEmail = async (input: {
  to: string;
  studentName: string;
  otp: string;
}): Promise<{ success: boolean; error?: string }> => {
  if (!config.smtp.user || !config.smtp.pass || !config.smtp.from) {
    return { success: false, error: 'Student verification email delivery is not configured.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
    await transporter.sendMail({
      from: config.smtp.from,
      to: input.to,
      subject: 'Approve a Newtoz parent link',
      text: `Hello ${input.studentName},\n\nA parent account requested access to your Newtoz LMS profile. If you approve, share this one-time code with the parent: ${input.otp}. It expires in 15 minutes. If you did not authorize this request, do not share the code.`,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email delivery failed.';
    console.error('Parent link verification email delivery failed:', message);
    return { success: false, error: 'Student verification email delivery failed.' };
  }
};
