import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Clearing all progress data...');

    // Delete all user progress
    const deletedProgress = await prisma.userProgress.deleteMany({});
    console.log(`✅ Deleted ${deletedProgress.count} progress records`);

    // Delete all point transactions
    const deletedPoints = await prisma.pointTransaction.deleteMany({});
    console.log(`✅ Deleted ${deletedPoints.count} point transactions`);

    // Reset all user points to 0
    const resetPoints = await prisma.user.updateMany({
        data: { points: 0 }
    });
    console.log(`✅ Reset points for ${resetPoints.count} users`);

    console.log('🏁 Database cleaned!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
