import Link from 'next/link';
import { MessageSquare, Users, TrendingUp } from 'lucide-react';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CreatePostForm from '@/components/community/CreatePostForm';
import PostCard from '@/components/community/PostCard';

interface CommunityPageProps {
    searchParams: Promise<{
        channelId?: string;
    }>;
}

export default async function CommunityPage(props: CommunityPageProps) {
    const searchParams = await props.searchParams;
    const session = await auth();
    const channelId = searchParams?.channelId;

    if (!session?.user) {
        redirect('/login');
    }

    // Fetch channels and posts
    const [channels, posts] = await Promise.all([
        prisma.channel.findMany({
            orderBy: { name: 'asc' },
        }),
        prisma.post.findMany({
            where: channelId ? { channelId } : undefined,
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 20,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                channel: true,
                comments: {
                    select: { id: true },
                },
            },
        }),
    ]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Community</h1>
                <p className="text-[var(--text-secondary)]">
                    Connect with other learners, share insights, and get help
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-[var(--primary)]" />
                        <div>
                            <p className="text-2xl font-bold">{posts.length}</p>
                            <p className="text-sm text-[var(--text-muted)]">Posts</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-[var(--success)]" />
                        <div>
                            <p className="text-2xl font-bold">{channels.length}</p>
                            <p className="text-sm text-[var(--text-muted)]">Channels</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-[var(--warning)]" />
                        <div>
                            <p className="text-2xl font-bold">{posts.reduce((acc, p) => acc + p.comments.length, 0)}</p>
                            <p className="text-sm text-[var(--text-muted)]">Comments</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Channels Sidebar */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-4">
                        <h3 className="font-bold mb-4">Channels</h3>
                        <div className="space-y-2">
                            <Link
                                href="/community"
                                className={`block p-2 rounded-lg cursor-pointer transition ${!channelId
                                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                                    : 'hover:bg-[var(--background-card)]'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm">All Posts</span>
                                </div>
                            </Link>

                            {channels.map((channel) => (
                                <Link
                                    key={channel.id}
                                    href={`/community?channelId=${channel.id}`}
                                    className={`block p-2 rounded-lg cursor-pointer transition ${channelId === channel.id
                                        ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                                        : 'hover:bg-[var(--background-card)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-sm">{channel.name}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Create Post */}
                    <CreatePostForm channels={channels} />

                    {/* Posts List */}
                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <div className="glass-card p-12 text-center">
                                <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <h3 className="font-bold mb-2">No posts yet</h3>
                                <p className="text-[var(--text-secondary)]">
                                    Be the first to start a discussion!
                                </p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
