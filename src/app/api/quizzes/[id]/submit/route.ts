import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { parseContentData } from '@/lib/json-helpers';

// POST /api/quizzes/[id]/submit - Submit quiz answers and calculate score
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
        const { answers } = body; // Expected: { questionId: selectedAnswer, ... }

        // Get lesson (must be a quiz)
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        if (lesson.contentType !== 'QUIZ') {
            return NextResponse.json({ error: 'This lesson is not a quiz' }, { status: 400 });
        }

        // Parse quiz content data
        const contentData = parseContentData(lesson.contentData);

        if (!contentData || contentData.type !== 'quiz') {
            return NextResponse.json({ error: 'Invalid quiz data' }, { status: 400 });
        }

        const questions = contentData.questions || [];

        if (questions.length === 0) {
            return NextResponse.json({ error: 'Quiz has no questions' }, { status: 400 });
        }

        // Calculate score
        let correctCount = 0;
        const results = questions.map((question: any) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correct_answer;
            if (isCorrect) correctCount++;

            return {
                questionId: question.id,
                question: question.question,
                userAnswer,
                correctAnswer: question.correct_answer,
                isCorrect,
                explanation: question.explanation || null,
            };
        });

        const score = Math.round((correctCount / questions.length) * 100);
        const passingScore = contentData.passing_score || 70;
        const passed = score >= passingScore;

        // Use transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update or create progress
            const progress = await tx.userProgress.upsert({
                where: {
                    userId_lessonId: {
                        userId,
                        lessonId,
                    },
                },
                update: {
                    quizScore: score,
                    status: passed ? 'COMPLETED' : 'IN_PROGRESS',
                    completedAt: passed ? new Date() : null,
                },
                create: {
                    userId,
                    lessonId,
                    quizScore: score,
                    status: passed ? 'COMPLETED' : 'IN_PROGRESS',
                    completedAt: passed ? new Date() : null,
                },
            });

            let pointsAwarded = 0;

            // Award points only if passed and not already completed
            if (passed && progress.completedAt &&
                (!progress.createdAt || progress.createdAt.getTime() === progress.completedAt.getTime())) {
                pointsAwarded = lesson.pointsValue;

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        points: {
                            increment: pointsAwarded,
                        },
                    },
                });

                await tx.pointTransaction.create({
                    data: {
                        userId,
                        action: `Passed quiz: ${lesson.title} (${score}%)`,
                        points: pointsAwarded,
                        referenceId: lessonId,
                    },
                });
            }

            return { progress, pointsAwarded };
        });

        return NextResponse.json({
            score,
            passed,
            passingScore,
            correctCount,
            totalQuestions: questions.length,
            results,
            progress: result.progress,
            pointsAwarded: result.pointsAwarded,
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
    }
}
