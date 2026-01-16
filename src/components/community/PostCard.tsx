import { MessageSquare, Pin, Lock } from 'lucide-react';

interface Post {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    commentsLocked: boolean;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        role: string;
    };
    channel: {
        name: string;
    };
    comments: { id: string }[];
}

export default function PostCard({ post }: { post: Post }) {
    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="glass-card p-6 hover:scale-[1.01] transition">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-medium shrink-0">
                        {post.user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{post.user.name}</p>
                            {post.user.role === 'ADMIN' && (
                                <span className="badge badge-success text-xs">Admin</span>
                            )}
                            {post.user.role === 'SUPER_ADMIN' && (
                                <span className="badge badge-warning text-xs">Super Admin</span>
                            )}
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                            {post.channel.name} • {formatTimeAgo(post.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {post.isPinned && (
                        <Pin className="w-5 h-5 text-[var(--warning)]" />
                    )}
                    {post.commentsLocked && (
                        <Lock className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold mb-2">{post.title}</h3>
            <p className="text-[var(--text-secondary)] mb-4 whitespace-pre-wrap">
                {post.content}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} comments</span>
                </div>
            </div>
        </div>
    );
}
