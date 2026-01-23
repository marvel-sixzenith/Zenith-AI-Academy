
import prisma from '@/lib/prisma';
import { parseContentData } from '@/lib/json-helpers';

export async function getLessonById(id: string, userId?: string) {
    const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: {
            module: {
                include: {
                    track: true,
                    lessons: {
                        where: { status: 'PUBLISHED' },
                        orderBy: { orderIndex: 'asc' },
                    },
                },
            },
            progress: userId ? {
                where: { userId },
            } : false,
            assignmentSubmissions: userId ? {
                where: { userId },
                orderBy: { submittedAt: 'desc' },
                take: 1
            } : false,
        },
    }) as any; // Temporary cast to avoid complex Prisma return type issues with conditional includes

    if (!lesson) {
        return null;
    }

    if (lesson.status !== 'PUBLISHED') {
        return null;
    }

    // Parse content data
    const rawProgress = (lesson as any).progress?.[0] || null;
    let userStatus = rawProgress?.status || 'LOCKED';

    // Parse assignment submission
    const currentSubmission = (lesson as any).assignmentSubmissions?.[0] || null;

    // Special handling for Video->Quiz conversion (same as in tracks.ts)
    if (lesson.contentType === 'QUIZ' && userStatus === 'COMPLETED' && (rawProgress?.quizScore === null || rawProgress?.quizScore === undefined)) {
        userStatus = 'UNLOCKED';
    }

    const lessonWithParsedData = {
        ...lesson,
        contentData: parseContentData(lesson.contentData),
        userProgress: rawProgress ? { ...rawProgress, status: userStatus } : null,
        currentSubmission
    };


    // Find prev/next lessons
    const allModules = await prisma.module.findMany({
        where: { trackId: lesson.module.trackId },
        include: {
            lessons: {
                where: { status: 'PUBLISHED' },
                orderBy: { orderIndex: 'asc' },
                include: {
                    progress: userId ? {
                        where: { userId },
                        select: { status: true }
                    } : false
                }
            },
        },
        orderBy: { orderIndex: 'asc' },
    });

    const allLessons = allModules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === id);

    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    // Check if current lesson should be unlocked based on previous lesson
    if (userStatus === 'LOCKED') {
        if (!prevLesson) {
            // First lesson of the track is always unlocked
            userStatus = 'UNLOCKED';
        } else if (prevLesson.progress && prevLesson.progress[0]?.status === 'COMPLETED') {
            // Previous lesson is completed, so this one is unlocked
            userStatus = 'UNLOCKED';
        }

        // Update the lesson object with the calculated status
        if (lessonWithParsedData.userProgress) {
            lessonWithParsedData.userProgress.status = userStatus;
        } else {
            // Create a temporary progress object for the frontend
            lessonWithParsedData.userProgress = {
                status: userStatus,
                userId: userId || '',
                lessonId: id,
                // Add other required fields with dummy values if needed by frontend types
            };
        }
    }

    return {
        lesson: lessonWithParsedData,
        navigation: {
            prev: prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null,
            next: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null,
        },
    };
}
