'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getUserPoints() {
    const session = await auth();
    if (!session?.user?.id) return 0;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { points: true },
    });

    return user?.points || 0;
}
