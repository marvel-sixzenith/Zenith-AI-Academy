
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                orderIndex: true
            }
        });
        console.log('Tracks found:', JSON.stringify(tracks, null, 2));

        const progress = await prisma.userProgress.findMany({
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: {
                lesson: {
                    select: {
                        title: true,
                        module: {
                            select: {
                                name: true,
                                track: {
                                    select: {
                                        name: true,
                                        slug: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        console.log('Recent Progress:', JSON.stringify(progress, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
