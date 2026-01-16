import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/lessons/[id]/complete - Mark lesson as complete and award points
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

        // Get lesson details
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Check if already completed
        const existingProgress = await prisma.userProgress.findUnique({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
        });

        if (existingProgress?.status === 'COMPLETED') {
            return NextResponse.json({
                message: 'Lesson already completed',
                progress: existingProgress,
            });
        }

        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Mark lesson as completed
            const progress = await tx.userProgress.upsert({
                where: {
                    userId_lessonId: {
                        userId,
                        lessonId,
                    },
                },
                update: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
                create: {
                    userId,
                    lessonId,
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });

            // Award points
            const pointsAwarded = lesson.pointsValue;

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

            return { progress, pointsAwarded };
        });

        return NextResponse.json({
            message: 'Lesson completed successfully',
            progress: result.progress,
            pointsAwarded: result.pointsAwarded,
        });
    } catch (error) {
        console.error('Error completing lesson:', error);
        return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 });
    }
}
