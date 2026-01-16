
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const tracks = await prisma.track.findMany({
            include: {
                modules: {
                    include: {
                        lessons: true
                    }
                }
            }
        });
        console.log('Tracks Deep:', JSON.stringify(tracks, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
