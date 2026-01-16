
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const lesson = await prisma.lesson.findFirst({
            where: {
                title: {
                    contains: "Automation"
                }
            },
            include: {
                module: {
                    include: {
                        track: true
                    }
                }
            }
        });
        console.log('Found Lesson:', JSON.stringify(lesson, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
