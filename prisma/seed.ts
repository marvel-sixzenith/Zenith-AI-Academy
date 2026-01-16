import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

async function main() {
    console.log('🌱 Starting database seed...');

    // Helper to create user if not exists
    const upsertUser = async (email: string, name: string, role: string, passwordPlain: string) => {
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role, // Ensure role is updated if changed
                password: hashedPassword, // Reset password to known value
            },
            create: {
                email,
                name,
                password: hashedPassword,
                role,

            },
        });

        console.log(`✅ Upserted user: ${email} (${role})`);
        return user;
    };

    // 1. Super Admin
    await upsertUser(
        'ade@zenithaiacademy.com',
        'Ade SuperAdmin',
        'SUPER_ADMIN',
        'superadmin'
    );

    // 2. Admin
    await upsertUser(
        'adechrysler@gmail.com',
        'Ade Chrysler',
        'ADMIN',
        'admin'
    );

    // 3. Member (User)
    await upsertUser(
        'test@gmail.com',
        'Test User',
        'MEMBER',
        'user'
    );

    console.log('🏁 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
