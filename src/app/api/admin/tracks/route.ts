import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/tracks - List all tracks
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tracks = await prisma.track.findMany({
            orderBy: { orderIndex: 'asc' },
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                },
                prerequisiteTrack: true,
            },
        });

        return NextResponse.json({ tracks });
    } catch (error) {
        console.error('Error fetching tracks:', error);
        return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
    }
}

// POST /api/admin/tracks - Create new track
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, description, icon, orderIndex, prerequisiteTrackId } = body;

        // Validate required fields
        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        // Check if slug already exists
        const existing = await prisma.track.findUnique({
            where: { slug },
        });

        if (existing) {
            return NextResponse.json({ error: 'Track with this slug already exists' }, { status: 400 });
        }

        const track = await prisma.track.create({
            data: {
                name,
                slug,
                description: description || null,
                icon: icon || null,
                orderIndex: orderIndex || 0,
                prerequisiteTrackId: prerequisiteTrackId || null,
            },
        });

        return NextResponse.json({ track }, { status: 201 });
    } catch (error) {
        console.error('Error creating track:', error);
        return NextResponse.json({ error: 'Failed to create track' }, { status: 500 });
    }
}
