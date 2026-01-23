import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Zenith AI Academy" <noreply@zenithai.com>',
            to: email,
            subject: 'Reset Password - Zenith AI Academy',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #7c3aed;">Zenith AI Academy</h1>
            </div>
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background-color: #ffffff;">
                <h2 style="margin-top: 0;">Reset Password</h2>
                <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
                <p>Klik tombol di bawah ini untuk membuat password baru:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
                <p style="color: #6b7280; font-size: 14px;">Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini dengan aman.</p>
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
