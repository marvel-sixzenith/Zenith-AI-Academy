import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/posts - Get posts (optionally filtered by channel)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const channelId = searchParams.get('channelId');

        const posts = await prisma.post.findMany({
            where: channelId ? { channelId } : {},
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                channel: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { channelId, title, content } = body;

        if (!channelId || !title || !content) {
            return NextResponse.json(
                { error: 'Channel ID, title, and content are required' },
                { status: 400 }
            );
        }

        // Check if channel exists and if it's admin-only
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
        });

        if (!channel) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
        }

        // Check if user can post in admin-only channels
        if (channel.isAdminOnly &&
            session.user.role !== 'ADMIN' &&
            session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Only admins can post in this channel' },
                { status: 403 }
            );
        }

        const post = await prisma.post.create({
            data: {
                channelId,
                userId,
                title,
                content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                channel: true,
            },
        });

        return NextResponse.json({ post }, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
