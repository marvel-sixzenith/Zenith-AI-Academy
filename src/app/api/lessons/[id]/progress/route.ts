import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/lessons/[id]/progress - Update lesson progress (score, status)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { id: lessonId } = await params;
        const body = await request.json();
        const { score, isCompleted } = body;

        // Get lesson details
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Check existing progress
        const existingProgress = await prisma.userProgress.findUnique({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
        });

        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            let pointsAwarded = 0;
            let newStatus = 'IN_PROGRESS';

            // Determine status
            if (isCompleted || existingProgress?.status === 'COMPLETED') {
                newStatus = 'COMPLETED';
            }

            // Award points ONLY if transitioning to COMPLETED for the first time
            if (isCompleted && existingProgress?.status !== 'COMPLETED') {
                pointsAwarded = lesson.pointsValue;

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        points: {
                            increment: pointsAwarded,
                        },
                    },
                });

                // Create point transaction record
                await tx.pointTransaction.create({
                    data: {
                        userId,
                        action: `Completed lesson: ${lesson.title}`,
                        points: pointsAwarded,
                        referenceId: lessonId,
                    },
                });
            }

            // Update/Create progress
            const progress = await tx.userProgress.upsert({
                where: {
                    userId_lessonId: {
                        userId,
                        lessonId,
                    },
                },
                update: {
                    status: newStatus,
                    quizScore: score !== undefined ? Math.round(score) : existingProgress?.quizScore,
                    completedAt: newStatus === 'COMPLETED' ? (existingProgress?.completedAt || new Date()) : existingProgress?.completedAt,
                },
                create: {
                    userId,
                    lessonId,
                    status: newStatus,
                    quizScore: score !== undefined ? Math.round(score) : null,
                    completedAt: newStatus === 'COMPLETED' ? new Date() : null,
                },
            });

            return { progress, pointsAwarded };
        });

        return NextResponse.json({
            message: 'Progress saved successfully',
            progress: result.progress,
            pointsAwarded: result.pointsAwarded,
        });
    } catch (error) {
        console.error('Error saving progress:', error);
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }
}
