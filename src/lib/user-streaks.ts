
import prisma from '@/lib/prisma';
import { differenceInCalendarDays } from 'date-fns';

/**
 * Checks and updates the user's daily streak.
 * Should be called when the user performs a significant action (login, visits dashboard, completes lesson).
 */
export async function checkAndUpdateStreak(userId: string) {
    if (!userId) return;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, currentStreak: true, longestStreak: true, lastActiveAt: true },
        });

        if (!user) return;

        const now = new Date();
        const lastActive = new Date(user.lastActiveAt);

        // Calculate difference in calendar days (ignores time)
        // 0 = same day, 1 = yesterday, >1 = missed a day
        const daysDiff = differenceInCalendarDays(now, lastActive);

        if (daysDiff === 0) {
            // Already active today, just update timestamp if needed (optional, but good for "last seen")
            await prisma.user.update({
                where: { id: userId },
                data: { lastActiveAt: now },
            });
            return { streak: user.currentStreak, updated: false };
        }

        let newStreak = user.currentStreak;

        if (daysDiff === 1) {
            // Consecutive day! Increment streak
            newStreak += 1;
        } else {
            // Missed a day (daysDiff > 1) or first time (daysDiff < 0 - shouldn't happen)
            // Reset to 1 (since they are active NOW)
            newStreak = 1;
        }

        // Update longest streak if needed
        const newLongest = Math.max(newStreak, user.longestStreak);

        await prisma.user.update({
            where: { id: userId },
            data: {
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastActiveAt: now,
            },
        });

        return { streak: newStreak, updated: true };

    } catch (error) {
        console.error('Error updating streak:', error);
        return null;
    }
}
