
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { lastNotificationCheck: true }
        });

        const lastCheck = user?.lastNotificationCheck || new Date(0);

        // Fetch recent Lessons (last 14 days)
        const recentLessons = await prisma.lesson.findMany({
            where: {
                status: 'PUBLISHED',
                createdAt: { gt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { module: { include: { track: true } } }
        });

        // Fetch recent Tracks
        const recentTracks = await prisma.track.findMany({
            where: {
                createdAt: { gt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        // Combine and map to Notification format
        const notifications = [
            ...recentLessons.map(l => ({
                id: `lesson-${l.id}`,
                type: 'LESSON',
                title: l.title,
                message: `New ${l.contentType.toLowerCase()} in ${l.module.name}`,
                link: `/lessons/${l.id}`,
                createdAt: l.createdAt,
                isNew: new Date(l.createdAt) > lastCheck
            })),
            ...recentTracks.map(t => ({
                id: `track-${t.id}`,
                type: 'TRACK',
                title: t.name,
                message: 'New learning track available',
                link: `/tracks/${t.slug}`,
                createdAt: t.createdAt,
                isNew: new Date(t.createdAt) > lastCheck
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10); // Limit total to 10

        const unreadCount = notifications.filter(n => n.isNew).length;

        return NextResponse.json({
            notifications,
            unreadCount,
            lastChecked: lastCheck
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
