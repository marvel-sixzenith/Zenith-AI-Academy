import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { lessonId, fileUrl, fileName, files, link, comment } = await req.json();

        if (!lessonId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // 1. Create Assignment Submission Record
        // Support both old (single file) and new (multi-file + link + comment) formats
        if (files || link || comment || fileUrl) {
            await prisma.assignmentSubmission.create({
                data: {
                    userId: session.user.id,
                    lessonId,
                    files: files || (fileUrl ? JSON.stringify([{ name: fileName || 'Uploaded File', url: fileUrl }]) : null),
                    link,
                    comment,
                    fileUrl: fileUrl || null, // Backwards compatibility if needed, or just nullable
                    fileName: fileName || null,
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
