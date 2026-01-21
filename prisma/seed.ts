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

    // 1. Super Admin (Converted to Admin)
    await upsertUser(
        'ade@zenithaiacademy.com',
        'Ade SuperAdmin',
        'ADMIN',
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

    // 4. Default Channels
    const channels = [
        { name: 'General', description: 'General discussion for everyone', slug: 'general', isAdminOnly: false },
        { name: 'Announcements', description: 'Official updates and news', slug: 'announcements', isAdminOnly: true },
        { name: 'Help', description: 'Get help with your code or lessons', slug: 'help', isAdminOnly: false },
        { name: 'Random', description: 'Off-topic conversations', slug: 'random', isAdminOnly: false },
    ];

    for (const channel of channels) {
        await prisma.channel.upsert({
            where: { slug: channel.slug },
            update: {
                name: channel.name,
                description: channel.description,
                isAdminOnly: channel.isAdminOnly
            },
            create: {
                name: channel.name,
                description: channel.description,
                slug: channel.slug,
                isAdminOnly: channel.isAdminOnly
            }
        });
        console.log(`✅ Upserted channel: ${channel.name}`);
    }

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
