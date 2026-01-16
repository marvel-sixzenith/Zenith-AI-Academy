
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tracks = await prisma.track.findMany();
    console.log('Tracks found:', tracks);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
