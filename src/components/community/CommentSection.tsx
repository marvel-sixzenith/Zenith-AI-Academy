"use client";

import { useState, useEffect } from 'react';
import { Send, User as UserIcon, Loader2, Trash2, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        image?: string;
        role: string;
    };
}

interface CommentSectionProps {
    postId: string;
    commentsLocked: boolean;
    initialCount?: number;
    currentUserId: string;
    currentUserRole: string;
    onCommentAdded?: () => void;
}

export default function CommentSection({ postId, commentsLocked, initialCount, currentUserId, currentUserRole, onCommentAdded }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/posts/${postId}/comments`);
                if (!res.ok) throw new Error('Failed to load comments');
                const data = await res.json();
                setComments(data);
            } catch (error) {
                console.error("Error loading comments:", error);
                toast.error("Could not load comments");
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to post comment');
            }

            const data = await res.json();
            // Add new comment to top of list
            setComments(prev => [data.comment, ...prev]);
            setNewComment('');
            toast.success("Comment posted!");
            if (onCommentAdded) onCommentAdded();

        } catch (error) {
            console.error("Error posting comment:", error);
            toast.error("Failed to post comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="bg-[var(--background-secondary)]/30 border-t border-[var(--border-color)] p-6 space-y-6 animate-fade-in">
            {/* Comment Form */}
            {!commentsLocked ? (
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full px-4 py-3 rounded-xl bg-[var(--background-card)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--primary)] transition"
                            disabled={isSubmitting}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            ) : (
                <div className="p-4 rounded-xl bg-[var(--background-secondary)] text-center text-[var(--text-muted)] text-sm">
                    Comments are locked for this post.
                </div>
            )}

            {/* Comments List */}
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold shrink-0 text-sm overflow-hidden">
                                {comment.user.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={comment.user.image} alt={comment.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    comment.user.name.charAt(0)
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="bg-[var(--background-card)] rounded-xl rounded-tl-none p-3 border border-[var(--border-color)] group">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{comment.user.name}</span>
                                            {comment.user.role === 'ADMIN' && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">ADMIN</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-[var(--text-muted)]">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{comment.content}</p>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[var(--border-color)]/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            // Reply logic to be enhanced, for now just focus input or @mention
                                            onClick={() => setNewComment(`@${comment.user.name} `)}
                                            className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] flex items-center gap-1"
                                        >
                                            <MessageCircle className="w-3 h-3" />
                                            Reply
                                        </button>

                                        {(currentUserId === comment.user.id || currentUserRole === 'ADMIN') && (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm('Delete this comment?')) return;
                                                    try {
                                                        await fetch(`/api/posts/${postId}/comments/${comment.id}`, { method: 'DELETE' });
                                                        setComments(prev => prev.filter(c => c.id !== comment.id));
                                                        toast.success('Comment deleted');
                                                    } catch (e) { toast.error('Failed to delete'); }
                                                }}
                                                className="text-xs text-[var(--text-muted)] hover:text-red-500 flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-[var(--text-muted)] py-4 text-sm">
                    No comments yet. Be the first to share your thoughts!
                </p>
            )}
        </div>
    );
}
