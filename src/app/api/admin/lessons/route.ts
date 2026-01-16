import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/admin/lessons - Create new lesson
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { moduleId, title, contentType, contentData, pointsValue, orderIndex, status } = body;

        // Validate required fields
        if (!moduleId || !title || !contentType) {
            return NextResponse.json(
                { error: 'Module ID, title, and content type are required' },
                { status: 400 }
            );
        }

        // Validate content type
        const validTypes = ['VIDEO', 'PDF', 'QUIZ', 'ASSIGNMENT'];
        if (!validTypes.includes(contentType)) {
            return NextResponse.json(
                { error: 'Invalid content type. Must be VIDEO, PDF, QUIZ, or ASSIGNMENT' },
                { status: 400 }
            );
        }

        // Verify module exists
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
        });

        if (!module) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        // Convert contentData to JSON string for storage
        const contentDataStr = typeof contentData === 'string'
            ? contentData
            : JSON.stringify(contentData || {});

        const lesson = await prisma.lesson.create({
            data: {
                moduleId,
                title,
                contentType,
                contentData: contentDataStr,
                pointsValue: pointsValue || 10,
                orderIndex: orderIndex || 0,
                status: status || 'DRAFT',
            },
        });

        return NextResponse.json({ lesson }, { status: 201 });
    } catch (error) {
        console.error('Error creating lesson:', error);
        return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
    }
}
