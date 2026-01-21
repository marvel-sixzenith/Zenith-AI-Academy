import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { lessonId, score, totalQuestions, answers } = await req.json();

        if (!lessonId || score === undefined || !answers) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // DEBUG: Write payload to file to verify what we received
        try {
            const fs = await import('fs');
            const path = await import('path');
            const debugPath = path.join(process.cwd(), 'debug_quiz_submission.json');
            fs.writeFileSync(debugPath, JSON.stringify({
                timestamp: new Date().toISOString(),
                lessonId,
                score,
                answersCount: answers.length,
                answersSample: answers.slice(0, 2)
            }, null, 2));
        } catch (e) {
            console.error("Failed to write debug file", e);
        }

        // 1. Create Quiz Submission Record
        const submission = await prisma.quizSubmission.create({
            data: {
                userId: session.user.id,
                lessonId,
                score,
                totalQuestions,
                answers: {
                    create: answers.map((a: any) => ({
                        questionId: a.questionId,
                        questionText: a.questionText,
                        selectedOption: a.selectedOption,
                        isCorrect: a.isCorrect
                    }))
                }
            }
        });

        // 2. Update User Progress (Mark Lesson as Completed)
        await prisma.userProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: session.user.id,
                    lessonId
                }
            },
            update: {
                status: 'COMPLETED',
                quizScore: score,
                completedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                userId: session.user.id,
                lessonId,
                status: 'COMPLETED',
                quizScore: score,
                completedAt: new Date()
            }
        });

        // 3. Award Points (Check if already awarded?)
        // Simple implementation: check if points already awarded for this lesson to avoid farming.
        // For now, we rely on the `complete-lesson` API or handle it here. 
        // To prevent double counting if the client calls both, we should ideally consolidate.
        // I will currently NOT award points here to avoid duplication if the client still calls the old `complete` endpoint, 
        // OR I should assume this REPLACES the old complete logic for Quizzes.

        // Let's stick to just saving data for now. The client likely handles point animation.

        return NextResponse.json(submission);
    } catch (error) {
        console.error('[QUIZ_SUBMIT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
