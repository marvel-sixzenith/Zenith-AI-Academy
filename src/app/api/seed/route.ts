import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        console.log('🌱 Starting database seed from API...');

        const upsertUser = async (email: string, name: string, role: string, passwordPlain: string) => {
            const hashedPassword = await bcrypt.hash(passwordPlain, 10);

            const user = await prisma.user.upsert({
                where: { email },
                update: {
                    role,
                    password: hashedPassword,
                },
                create: {
                    email,
                    name,
                    password: hashedPassword,
                    role,
                },
            });
            return user;
        };

        const superAdmin = await upsertUser('ade@zenithaiacademy.com', 'Ade SuperAdmin', 'SUPER_ADMIN', 'superadmin');
        const admin = await upsertUser('adechrysler@gmail.com', 'Ade Chrysler', 'ADMIN', 'admin');
        const member = await upsertUser('test@gmail.com', 'Test User', 'MEMBER', 'user');

        return NextResponse.json({
            success: true,
            message: 'Seeding completed successfully',
            users: [superAdmin.email, admin.email, member.email]
        });
    } catch (error: unknown) {
        console.error('Seeding failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
