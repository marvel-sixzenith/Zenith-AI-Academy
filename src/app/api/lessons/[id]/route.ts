import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLessonById } from '@/lib/lessons';

// GET /api/lessons/[id] - Get lesson content
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const { id } = await params;

        const data = await getLessonById(id, userId);

        if (!data) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
    }
}
