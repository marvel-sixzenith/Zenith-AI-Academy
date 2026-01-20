
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
        },
    });

    if (!lesson) {
        return null;
    }

    if (lesson.status !== 'PUBLISHED') {
        return null;
    }

    // Parse content data
    const rawProgress = (lesson as any).progress?.[0] || null;
    let userStatus = rawProgress?.status || 'LOCKED';

    // Special handling for Video->Quiz conversion (same as in tracks.ts)
    if (lesson.contentType === 'QUIZ' && userStatus === 'COMPLETED' && (rawProgress?.quizScore === null || rawProgress?.quizScore === undefined)) {
        userStatus = 'UNLOCKED';
    }

    const lessonWithParsedData = {
        ...lesson,
        contentData: parseContentData(lesson.contentData),
        userProgress: rawProgress ? { ...rawProgress, status: userStatus } : null,
    };

    // Find prev/next lessons
    const allModules = await prisma.module.findMany({
        where: { trackId: lesson.module.trackId },
        include: {
            lessons: {
                where: { status: 'PUBLISHED' },
                orderBy: { orderIndex: 'asc' },
            },
        },
        orderBy: { orderIndex: 'asc' },
    });

    const allLessons = allModules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === id);

    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return {
        lesson: lessonWithParsedData,
        navigation: {
            prev: prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null,
            next: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null,
        },
    };
}
