import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/tracks/[id] - Get single track
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

        const track = await prisma.track.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                    orderBy: { orderIndex: 'asc' },
                },
                prerequisiteTrack: true,
            },
        });

        if (!track) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        return NextResponse.json({ track });
    } catch (error) {
        console.error('Error fetching track:', error);
        return NextResponse.json({ error: 'Failed to fetch track' }, { status: 500 });
    }
}

// PUT /api/admin/tracks/[id] - Update track
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
        const { name, slug, description, icon, orderIndex, prerequisiteTrackId } = body;

        // Check if track exists
        const existing = await prisma.track.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        // If slug is being changed, check for duplicates
        if (slug && slug !== existing.slug) {
            const duplicate = await prisma.track.findUnique({
                where: { slug },
            });

            if (duplicate) {
                return NextResponse.json({ error: 'Track with this slug already exists' }, { status: 400 });
            }
        }

        const track = await prisma.track.update({
            where: { id },
            data: {
                name: name || existing.name,
                slug: slug || existing.slug,
                description: description !== undefined ? description : existing.description,
                icon: icon !== undefined ? icon : existing.icon,
                orderIndex: orderIndex !== undefined ? orderIndex : existing.orderIndex,
                prerequisiteTrackId: prerequisiteTrackId !== undefined ? prerequisiteTrackId : existing.prerequisiteTrackId,
            },
        });

        return NextResponse.json({ track });
    } catch (error) {
        console.error('Error updating track:', error);
        return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
    }
}

// DELETE /api/admin/tracks/[id] - Delete track
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

        // Check if track exists
        const existing = await prisma.track.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        // Delete track (cascade will delete modules and lessons)
        await prisma.track.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Track deleted successfully' });
    } catch (error) {
        console.error('Error deleting track:', error);
        return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
    }
}
