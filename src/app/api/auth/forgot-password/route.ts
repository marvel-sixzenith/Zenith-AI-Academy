import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Always return success (security: don't reveal if email exists)
        if (!user) {
            return NextResponse.json({ message: 'If an account with that email exists, we sent a reset link' });
        }

        // Generate reset token
        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        // Delete any existing tokens for this email
        await prisma.passwordReset.deleteMany({
            where: { email },
        });

        // Create new reset token
        await prisma.passwordReset.create({
            data: {
                email,
                token,
                expires,
            },
        });

        // TODO: Send email with reset link
        // For now, log the token (in production, use SMTP)
        console.log(`Password reset link: ${process.env.NEXTAUTH_URL}/reset-password?token=${token}`);

        return NextResponse.json({ message: 'If an account with that email exists, we sent a reset link' });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}
