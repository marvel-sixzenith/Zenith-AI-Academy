import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { parseContentData } from '@/lib/json-helpers';

// GET /api/admin/lessons/[id] - Get lesson
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: {
                module: {
                    include: {
                        track: true,
                    },
                },
            },
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Parse JSON content data
        const lessonWithParsedData = {
            ...lesson,
            contentData: parseContentData(lesson.contentData),
        };

        return NextResponse.json({ lesson: lessonWithParsedData });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
    }
}

// PUT /api/admin/lessons/[id] - Update lesson
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, contentType, contentData, pointsValue, orderIndex, status } = body;

        const existing = await prisma.lesson.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Validate content type if provided
        if (contentType) {
            const validTypes = ['VIDEO', 'PDF', 'QUIZ', 'ASSIGNMENT'];
            if (!validTypes.includes(contentType)) {
                return NextResponse.json(
                    { error: 'Invalid content type' },
                    { status: 400 }
                );
            }
        }

        // Convert contentData to JSON string if provided
        const contentDataStr = contentData !== undefined
            ? (typeof contentData === 'string' ? contentData : JSON.stringify(contentData))
            : undefined;

        const lesson = await prisma.lesson.update({
            where: { id },
            data: {
                title: title || existing.title,
                contentType: contentType || existing.contentType,
                contentData: contentDataStr !== undefined ? contentDataStr : existing.contentData,
                pointsValue: pointsValue !== undefined ? pointsValue : existing.pointsValue,
                orderIndex: orderIndex !== undefined ? orderIndex : existing.orderIndex,
                status: status || existing.status,
            },
        });

        return NextResponse.json({ lesson });
    } catch (error) {
        console.error('Error updating lesson:', error);
        return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
    }
}

// DELETE /api/admin/lessons/[id] - Delete lesson
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.lesson.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        await prisma.lesson.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
    }
}
