import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        // Find token in DB
        const resetRecord = await prisma.passwordReset.findUnique({
            where: { token },
        });

        if (!resetRecord) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 400 }
            );
        }

        // Check expiration
        if (new Date() > resetRecord.expires) {
            // Clean up expired token
            await prisma.passwordReset.delete({ where: { token } });
            return NextResponse.json(
                { error: 'Token has expired' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: resetRecord.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and delete token
        await prisma.$transaction([
            prisma.user.update({
                where: { email: resetRecord.email },
                data: { password: hashedPassword },
            }),
            prisma.passwordReset.delete({
                where: { token },
            }),
        ]);

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}
