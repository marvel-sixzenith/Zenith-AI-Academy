'use client';

import { useState } from 'react';
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
                className="btn-secondary"
            >
                Mark as Complete
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card p-6 max-w-md w-full animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Mark as Complete?</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded hover:bg-[var(--background-card)]"
                                disabled={isSubmitting}
                            >
                                <CheckCircle className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        <p className="text-[var(--text-secondary)] mb-6">
                            Are you sure you want to mark &quot;{lessonTitle}&quot; as complete?
                            {contentType === 'VIDEO' && ' Make sure you\'ve watched the entire video.'}
                            {contentType === 'PDF' && ' Make sure you\'ve read the entire document.'}
                            {contentType === 'ASSIGNMENT' && ' Make sure you\'ve completed the assignment.'}
                        </p>

                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn-secondary"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleComplete}
                                className="btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Confirm Complete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
