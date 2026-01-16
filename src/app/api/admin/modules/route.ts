import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/admin/modules - Create new module
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { trackId, name, description, orderIndex } = body;

        // Validate required fields
        if (!trackId || !name) {
            return NextResponse.json({ error: 'Track ID and name are required' }, { status: 400 });
        }

        // Verify track exists
        const track = await prisma.track.findUnique({
            where: { id: trackId },
        });

        if (!track) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        const module = await prisma.module.create({
            data: {
                trackId,
                name,
                description: description || null,
                orderIndex: orderIndex || 0,
            },
        });

        return NextResponse.json({ module }, { status: 201 });
    } catch (error) {
        console.error('Error creating module:', error);
        return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
    }
}
