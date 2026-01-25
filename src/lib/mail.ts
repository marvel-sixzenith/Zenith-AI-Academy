import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    try {
        await resend.emails.send({
            from: 'Zenith AI Academy <onboarding@resend.dev>', // Or your verified domain
            to: email,
            subject: 'Reset Password - Zenith AI Academy',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #7c3aed;">Zenith AI Academy</h1>
            </div>
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background-color: #ffffff;">
                <h2 style="margin-top: 0;">Reset Password</h2>
                <p>You received this email because of a password reset request.</p>
                <p>Click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>This link expires in 1 hour.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        </div>
      `,
        });
        console.log('Password reset email sent to:', email);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
