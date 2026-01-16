import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting...');
    const count = await prisma.user.count();
    console.log('Total users:', count);
    const users = await prisma.user.findMany({
      select: { email: true, role: true }
    });
    console.log('User emails:', users);
  } catch (e) {
    console.error('Error connecting or querying:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
