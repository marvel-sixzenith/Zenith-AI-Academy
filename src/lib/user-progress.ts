
import prisma from '@/lib/prisma';
import { getLessonById } from './lessons';

export async function getLastActiveLesson(userId: string) {
    // 1. Get the most recently updated progress
    const lastProgress = await prisma.userProgress.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            lesson: {
                include: {
                    module: {
                        include: {
                            track: true
                        }
                    }
                }
            }
        }
    }) as any;

    if (!lastProgress) {
        // If no progress at all, find the first lesson of the first track
        const firstTrack = await prisma.track.findFirst({
            orderBy: { orderIndex: 'asc' },
            include: {
                modules: {
                    orderBy: { orderIndex: 'asc' },
                    take: 1,
                    include: {
                        lessons: {
                            orderBy: { orderIndex: 'asc' },
                            take: 1,
                            include: {
                                module: {
                                    include: {
                                        track: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (firstTrack?.modules[0]?.lessons[0]) {
            return firstTrack.modules[0].lessons[0];
        }

        return null;
    }

    // If the last lesson was completed, try to find the next one
    if (lastProgress.status === 'COMPLETED') {
        const currentLesson = lastProgress.lesson;

        // Use our existing helper to check for next lesson
        const lessonData = await getLessonById(currentLesson.id, userId);
        if (lessonData?.navigation?.next) {
            // We need full details for the dashboard card (track name, etc) so we fetch it again or partially constructed
            // Ideally getLessonById should return enough info, but navigation.next is just {id, title}.
            // Let's just fetch the next lesson details.
            const nextLesson = await prisma.lesson.findUnique({
                where: { id: lessonData.navigation.next.id },
                include: {
                    module: {
                        include: {
                            track: true
                        }
                    }
                }
            });
            return nextLesson;
        } else {
            // Track finished? Or Module finished? 
            // Maybe return the same lesson but with completed status? 
            // Or find the next track?
            // For now, let's just return the current completed lesson, user can see they finished it.
            return currentLesson;
        }
    }

    // If IN_PROGRESS or LOCKED (weird), return it
    return lastProgress.lesson;
}
