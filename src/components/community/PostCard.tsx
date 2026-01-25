"use client";

import { useState } from 'react';
import { MessageSquare, Pin, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import CommentSection from './CommentSection';

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

export default function PostCard({ post, currentUserId, currentUserRole }: { post: Post; currentUserId: string; currentUserRole: string; }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [commentCount, setCommentCount] = useState(post.comments.length);

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="glass-card p-4 md:p-6 transition">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2.5 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-medium shrink-0 text-sm md:text-base">
                        {post.user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                            <p className="font-medium text-sm md:text-base">{post.user.name}</p>
                            {post.user.role === 'ADMIN' && (
                                <span className="badge badge-success text-[10px] md:text-xs px-1.5 py-0.5">Admin</span>
                            )}
                            {post.user.role === 'SUPER_ADMIN' && (
                                <span className="badge badge-warning text-[10px] md:text-xs px-1.5 py-0.5">Super Admin</span>
                            )}
                        </div>
                        <p className="text-xs md:text-sm text-[var(--text-muted)]">
                            {post.channel.name} • {formatTimeAgo(post.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 md:gap-2">
                    {post.isPinned && (
                        <Pin className="w-4 h-4 md:w-5 md:h-5 text-[var(--warning)]" />
                    )}
                    {post.commentsLocked && (
                        <Lock className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-muted)]" />
                    )}
                </div>
            </div>

            {/* Content */}
            <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2">{post.title}</h3>
            <p className="text-sm md:text-base text-[var(--text-secondary)] mb-3 md:mb-4 whitespace-pre-wrap">
                {post.content}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-[var(--text-muted)] border-t border-[var(--border-color)] pt-3 md:pt-4 mt-3 md:mt-4">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1.5 md:gap-2 hover:text-[var(--primary)] transition"
                >
                    <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>{commentCount} comments</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 ml-0.5" />}
                </button>
            </div>

            {/* Comment Section */}
            {isExpanded && (
                <CommentSection
                    postId={post.id}
                    commentsLocked={post.commentsLocked}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    onCommentAdded={() => setCommentCount(prev => prev + 1)}
                />
            )}
        </div>
    );
}
