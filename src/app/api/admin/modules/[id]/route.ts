import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/admin/modules/[id] - Update module
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
        const { name, description, orderIndex, trackId } = body;

        const existing = await prisma.module.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        const module = await prisma.module.update({
            where: { id },
            data: {
                name: name || existing.name,
                description: description !== undefined ? description : existing.description,
                orderIndex: orderIndex !== undefined ? orderIndex : existing.orderIndex,
                trackId: trackId || existing.trackId,
            },
        });

        return NextResponse.json({ module });
    } catch (error) {
        console.error('Error updating module:', error);
        return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
    }
}

// DELETE /api/admin/modules/[id] - Delete module
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

        const existing = await prisma.module.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        await prisma.module.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
    }
}
