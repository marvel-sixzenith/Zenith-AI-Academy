'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleBanUser(userId: string) {
    const session = await auth();

    // Authorization Check
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
        // Technically ADMIN can ban MEMBER, but let's restrict to SUPER_ADMIN or check hierarchy
        // For now, let's allow ADMIN to ban if they are not banning another ADMIN
        if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }
    }

    try {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return { success: false, error: 'User not found' };

        // Prevent banning yourself
        if (targetUser.id === session.user.id) {
            return { success: false, error: 'Cannot ban yourself' };
        }

        // Toggle banned status
        const isBanned = (targetUser as any).banned;
        await prisma.user.update({
            where: { id: userId },
            data: { banned: !isBanned } as any
        });

        revalidatePath(`/admin/users/${userId}`);
        revalidatePath('/admin/users');
        return { success: true, isBanned: !isBanned };

    } catch (error) {
        console.error('Failed to toggle ban:', error);
        return { success: false, error: 'Database error' };
    }
}
