'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LessonCompleteButtonProps {
    lessonId: string;
    lessonTitle: string;
    contentType: string;
}

export default function LessonCompleteButton({ lessonId, lessonTitle, contentType }: LessonCompleteButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleComplete = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(`/api/lessons/${lessonId}/complete`, {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to complete lesson');
            }

            // Show success message briefly
            setShowModal(false);

            // Refresh the page to show updated status
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="btn-secondary group hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300"
            >
                <CheckCircle className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>Mark as Complete</span>
            </button>

            {showModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop with blur and darken */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                        onClick={() => !isSubmitting && setShowModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-[#0f172a] border border-blue-500/20 rounded-2xl p-8 max-w-md w-full animate-slide-up flex flex-col items-center text-center shadow-2xl shadow-black/80 z-10">

                        {/* Glowing Icon Header */}
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                            <CheckCircle className="w-16 h-16 text-blue-500 relative z-10 animate-pulse-slow" />
                        </div>

                        <h2 className="text-2xl font-bold mb-2 text-gradient">Mark as Complete?</h2>

                        <p className="text-[var(--text-secondary)] mb-8 text-base leading-relaxed">
                            Are you sure you want to mark <span className="text-[var(--text-primary)] font-medium">&quot;{lessonTitle}&quot;</span> as complete?
                            <span className="block mt-2 text-sm text-[var(--text-muted)]">
                                {contentType === 'VIDEO' && 'Make sure you\'ve watched the entire video.'}
                                {contentType === 'PDF' && 'Make sure you\'ve read the entire document.'}
                                {contentType === 'ASSIGNMENT' && 'Make sure you\'ve completed the assignment.'}
                            </span>
                        </p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 w-full text-left animate-shake">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-3 w-full">
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn-secondary flex-1 justify-center py-3.5 hover:bg-white/5 border-white/10 text-[var(--text-secondary)] hover:text-white"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleComplete}
                                className="btn-primary flex-1 justify-center py-3.5 shadow-lg shadow-blue-500/20"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Confirm</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
