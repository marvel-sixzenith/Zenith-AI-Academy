
import prisma from '@/lib/prisma';

export async function getTracks(userId?: string) {
    const tracks = await prisma.track.findMany({
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        include: {
            modules: {
                include: {
                    lessons: {
                        where: { status: 'PUBLISHED' },
                        include: userId ? {
                            progress: {
                                where: { userId },
                            },
                        } : undefined,
                    },
                },
                orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
            },
            prerequisiteTrack: true,
        },
    });

    // Calculate progress for each track
    const tracksWithProgress = tracks.map((track) => {
        const allLessons = track.modules.flatMap((m) => m.lessons);
        const completedLessons = userId
            ? allLessons.filter((l: any) => l.progress?.some((p: any) => p.status === 'COMPLETED')).length
            : 0;

        return {
            ...track,
            totalLessons: allLessons.length,
            completedLessons,
            progress: allLessons.length > 0
                ? Math.round((completedLessons / allLessons.length) * 100)
                : 0,
        };
    });

    return tracksWithProgress;
}

export async function getTrackBySlug(slug: string, userId?: string) {
    const track = await prisma.track.findUnique({
        where: { slug },
        include: {
            modules: {
                include: {
                    lessons: {
                        where: { status: 'PUBLISHED' },
                        include: userId ? {
                            progress: {
                                where: { userId },
                            },
                        } : undefined,
                        orderBy: { orderIndex: 'asc' },
                    },
                },
                orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
            },
            prerequisiteTrack: true,
        },
    });

    if (!track) {
        return null;
    }

    // Check if prerequisite track is completed
    if (track.prerequisiteTrackId && userId) {
        const prerequisiteTrack = await prisma.track.findUnique({
            where: { id: track.prerequisiteTrackId },
            include: {
                modules: {
                    include: {
                        lessons: {
                            where: { status: 'PUBLISHED' },
                            include: {
                                progress: {
                                    where: { userId },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (prerequisiteTrack) {
            const allPrereqLessons = prerequisiteTrack.modules.flatMap((m) => m.lessons);
            const completedPrereqLessons = allPrereqLessons.filter(
                (l: any) => l.progress?.some((p: any) => p.status === 'COMPLETED')
            ).length;

            const isPrerequisiteComplete = allPrereqLessons.length > 0
                && completedPrereqLessons === allPrereqLessons.length;

            if (!isPrerequisiteComplete) {
                return {
                    ...track,
                    isLocked: true,
                    lockReason: `Complete ${prerequisiteTrack.name} to unlock this track`,
                };
            }
        }
    }

    // Implement progressive unlock within track
    const modulesWithUnlockStatus = track.modules.map((module, moduleIndex) => {
        const lessonsWithStatus = module.lessons.map((lesson: any, lessonIndex) => {
            let unlockStatus = 'LOCKED';

            // First lesson is always unlocked
            if (moduleIndex === 0 && lessonIndex === 0) {
                unlockStatus = 'UNLOCKED';
            } else if (userId) {
                // Check if previous lesson is completed
                const previousLesson = lessonIndex > 0
                    ? module.lessons[lessonIndex - 1]
                    : (moduleIndex > 0 ? track.modules[moduleIndex - 1].lessons.slice(-1)[0] : null);

                if (previousLesson) {
                    const isPreviousCompleted = (previousLesson as any).progress?.some(
                        (p: any) => p.status === 'COMPLETED'
                    ) || false;
                    unlockStatus = isPreviousCompleted ? 'UNLOCKED' : 'LOCKED';
                }
            }

            const userProgress = lesson.progress?.[0];
            let userStatus = userProgress?.status || 'LOCKED';

            // Special handling: If a lesson was completed as a non-quiz (e.g. Video) 
            // but is now a Quiz, it needs a score to be properly "completed".
            // If quizScore is null but status is COMPLETED, treat it as UNLOCKED (new).
            if (lesson.contentType === 'QUIZ' && userStatus === 'COMPLETED' && (userProgress?.quizScore === null || userProgress?.quizScore === undefined)) {
                userStatus = 'UNLOCKED';
            }

            return {
                ...lesson,
                unlockStatus,
                userStatus,
                completedAt: userProgress?.completedAt,
                quizScore: userProgress?.quizScore,
            };
        });

        return {
            ...module,
            lessons: lessonsWithStatus,
        };
    });

    return {
        ...track,
        modules: modulesWithUnlockStatus,
        isLocked: false,
    };
}
