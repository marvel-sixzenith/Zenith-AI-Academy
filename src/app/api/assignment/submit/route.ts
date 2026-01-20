import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { lessonId, fileUrl, fileName } = await req.json();

        if (!lessonId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // 1. Create Assignment Submission Record (Optional if files are uploaded)
        if (fileUrl) {
            await prisma.assignmentSubmission.create({
                data: {
                    userId: session.user.id,
                    lessonId,
                    fileUrl,
                    fileName: fileName || 'Uploaded File',
                    status: 'SUBMITTED'
                }
            });
        }

        // 2. Mark Lesson as Completed
        await prisma.userProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: session.user.id,
                    lessonId
                }
            },
            update: {
                status: 'COMPLETED',
                completedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                userId: session.user.id,
                lessonId,
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[ASSIGNMENT_SUBMIT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
