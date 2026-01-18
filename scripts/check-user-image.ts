
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking user "test@gmail.com"...');
    const user = await prisma.user.findUnique({
        where: { email: 'test@gmail.com' },
        select: { id: true, name: true, image: true, email: true }
    });
    console.log('User found:', user);

    if (user?.image) {
        console.log('Image URL:', user.image);
    } else {
        console.log('No image found for this user.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
