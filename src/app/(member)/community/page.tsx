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
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Komunitas</h1>
                <p className="text-xs md:text-base text-[var(--text-secondary)]">
                    Diskusi, berbagi, dan dapatkan bantuan
                </p>
            </div>

            {/* Stats - Compact 3-column on mobile */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="glass-card p-3 md:p-5">
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 text-center md:text-left">
                        <MessageSquare className="w-5 h-5 md:w-7 md:h-7 text-[var(--primary)]" />
                        <div>
                            <p className="text-lg md:text-2xl font-bold">{posts.length}</p>
                            <p className="text-[10px] md:text-sm text-[var(--text-muted)]">Posts</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-3 md:p-5">
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 text-center md:text-left">
                        <Users className="w-5 h-5 md:w-7 md:h-7 text-[var(--success)]" />
                        <div>
                            <p className="text-lg md:text-2xl font-bold">{channels.length}</p>
                            <p className="text-[10px] md:text-sm text-[var(--text-muted)]">Channels</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-3 md:p-5">
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 text-center md:text-left">
                        <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-[var(--warning)]" />
                        <div>
                            <p className="text-lg md:text-2xl font-bold">{posts.reduce((acc, p) => acc + p.comments.length, 0)}</p>
                            <p className="text-[10px] md:text-sm text-[var(--text-muted)]">Comments</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
                {/* Channels Sidebar - Horizontal scroll on mobile */}
                <div className="lg:col-span-1 order-first">
                    <div className="glass-card p-3 md:p-4">
                        <h3 className="font-bold text-sm md:text-base mb-3 md:mb-4">Channels</h3>
                        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1">
                            <Link
                                href="/community"
                                className={`shrink-0 lg:shrink block p-2 rounded-lg cursor-pointer transition text-xs md:text-sm ${!channelId
                                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                                    : 'hover:bg-[var(--background-card)]'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span className="whitespace-nowrap">All Posts</span>
                                </div>
                            </Link>

                            {channels.map((channel) => (
                                <Link
                                    key={channel.id}
                                    href={`/community?channelId=${channel.id}`}
                                    className={`shrink-0 lg:shrink block p-2 rounded-lg cursor-pointer transition text-xs md:text-sm ${channelId === channel.id
                                        ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                                        : 'hover:bg-[var(--background-card)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <span className="whitespace-nowrap">{channel.name}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="lg:col-span-3 space-y-4 md:space-y-6">
                    {/* Create Post */}
                    <CreatePostForm
                        channels={channels.filter(c => !c.isAdminOnly || session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN')}
                    />

                    {/* Posts List */}
                    <div className="space-y-3 md:space-y-4">
                        {posts.length === 0 ? (
                            <div className="glass-card p-8 md:p-12 text-center">
                                <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-[var(--text-muted)] mx-auto mb-3 md:mb-4" />
                                <h3 className="font-bold text-sm md:text-base mb-1 md:mb-2">Belum ada postingan</h3>
                                <p className="text-xs md:text-sm text-[var(--text-secondary)]">
                                    Jadilah yang pertama memulai diskusi!
                                </p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    currentUserId={session.user.id}
                                    currentUserRole={session.user.role}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
