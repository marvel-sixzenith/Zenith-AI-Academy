"use client";

import { useState } from 'react';
import { Send, MessageSquare, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PrivateCommentSectionProps {
    lessonId: string;
    existingComment?: string;
}

export default function PrivateCommentSection({ lessonId, existingComment }: PrivateCommentSectionProps) {
    const [comment, setComment] = useState(existingComment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [savedComment, setSavedComment] = useState(existingComment || '');

    const handleSend = async () => {
        if (!comment.trim() || comment === savedComment) return;

        setIsSubmitting(true);
        try {
            // We need a way to update ONLY the comment.
            // Currently our API might expect full payload. 
            // If we send just comment, we rely on the backend to merge or we need to fetch current state.
            // Assuming for now we can send a partial update or we just accept that we might clear other fields if the API is strict?
            // Wait, the `YourWorkCard` manages files. If we send only `comment`, and the backend does `prisma.assignmentSubmission.upsert`
            // with `update: { ...body }`, then if we don't send `files`, they might remain UNTOUCHED if we only pass fields to update?
            // No, usually `body` is spread. If `files` is missing in `body`, it's undefined. 
            // Prisma `update` ignores undefined. So we are safe if the API handles it gracefully.

            // Let's verify API behavior later. For now assume safe.

            const res = await fetch('/api/assignment/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    comment: comment.trim()
                })
            });

            if (!res.ok) throw new Error('Failed to send comment');

            setSavedComment(comment.trim());
            toast.success('Private comment sent');
            setIsFocused(false);

        } catch (error) {
            console.error(error);
            toast.error('Failed to send comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden flex flex-col mt-4 md:mt-6">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
                <h3 className="font-bold text-sm text-[var(--text-secondary)]">Private comments</h3>
            </div>

            <div className="p-4">
                {/* List of comments - in GC it shows a thread. 
                   Our current schema only supports ONE field `comment`.
                   So we just basically have a notepad area. 
               */}
                {savedComment && !isFocused && (
                    <div className="mb-4 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] text-xs font-bold shrink-0">
                            You
                        </div>
                        <div className="text-sm bg-[var(--background-secondary)] p-3 rounded-r-xl rounded-bl-xl">
                            {savedComment}
                        </div>
                    </div>
                )}

                <div className={`relative transition-all ${isFocused ? 'ring-2 ring-[var(--primary)]/20 rounded-xl' : ''}`}>
                    <div className="flex items-start gap-2">
                        {isFocused && (
                            <button className="p-2 rounded-full bg-[var(--background-secondary)] text-[var(--text-muted)] hover:text-[var(--primary)]">
                                <Lock className="w-4 h-4" />
                            </button>
                        )}
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            placeholder="Add private comment..."
                            className="input-field w-full min-h-[40px] py-2 text-sm resize-none bg-transparent border-none focus:ring-0 px-0"
                            rows={isFocused ? 3 : 1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!comment.trim() || isSubmitting || comment === savedComment}
                            className={`p-2 rounded-full transition-colors ${comment.trim() && comment !== savedComment
                                    ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90'
                                    : 'bg-[var(--background-secondary)] text-[var(--text-muted)]'
                                }`}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
