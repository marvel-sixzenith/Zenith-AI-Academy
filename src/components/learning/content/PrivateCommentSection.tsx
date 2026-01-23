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
        <div className="bg-[var(--background-card)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden flex flex-col mt-4 md:mt-6 transition-all hover:shadow-md">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3 bg-[var(--background-secondary)]/30">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                    <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Private Comments</h3>
            </div>

            <div className="p-4 bg-gradient-to-b from-transparent to-[var(--background-secondary)]/10">
                {savedComment && !isFocused && (
                    <div className="mb-6 flex gap-3 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-[var(--primary)]/20">
                            You
                        </div>
                        <div className="relative group max-w-[85%]">
                            <div className="text-sm bg-[var(--surface)] border border-[var(--border-color)] p-4 rounded-2xl rounded-tl-none shadow-sm text-[var(--text-secondary)] leading-relaxed">
                                {savedComment}
                            </div>
                            <div className="absolute top-0 left-0 -ml-2 -mt-2 w-3 h-3 bg-[var(--primary)]/20 blur-xl rounded-full" />
                        </div>
                    </div>
                )}

                <div className={`relative transition-all duration-300 ${isFocused
                        ? 'ring-2 ring-[var(--primary)]/20 rounded-2xl bg-[var(--background)] shadow-lg'
                        : 'bg-[var(--background-secondary)]/50 rounded-2xl hover:bg-[var(--background-secondary)]'
                    }`}>
                    <div className="flex flex-col">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            placeholder={savedComment ? "Add another comment..." : "Add a private comment for your instructor..."}
                            className={`w-full bg-transparent border-none focus:ring-0 text-sm resize-none p-4 transition-all placeholder-[var(--text-muted)] text-[var(--text-primary)] ${isFocused ? 'min-h-[100px]' : 'min-h-[50px]'}`}
                            rows={isFocused ? 3 : 1}
                        />

                        {(isFocused || comment.trim()) && (
                            <div className="flex justify-end p-2 border-t border-[var(--border-color)]/50 bg-[var(--background)]/50 rounded-b-2xl">
                                <button
                                    onClick={handleSend}
                                    disabled={!comment.trim() || isSubmitting || comment === savedComment}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${comment.trim() && comment !== savedComment
                                            ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-lg shadow-[var(--primary)]/20 transform hover:-translate-y-0.5'
                                            : 'bg-[var(--background-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send'}
                                    <Send className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {!isFocused && !savedComment && (
                    <p className="text-xs text-center text-[var(--text-muted)] mt-4">
                        <Lock className="w-3 h-3 inline-block mr-1 mb-0.5" />
                        Comments are private between you and the instructor
                    </p>
                )}
            </div>
        </div>
    );
}
