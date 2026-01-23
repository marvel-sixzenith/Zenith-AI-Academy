'use server';

import prisma from '@/lib/prisma';

export async function checkLessonUpdate(lessonId: string): Promise<string | null> {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { updatedAt: true }
        });

        return lesson?.updatedAt?.toISOString() || null;
    } catch (error) {
        console.error('Error checking lesson update:', error);
        return null;
    }
}
