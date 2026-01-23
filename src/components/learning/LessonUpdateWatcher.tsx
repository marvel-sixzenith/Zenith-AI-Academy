'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { checkLessonUpdate } from '@/actions/lessons';
import { RefreshCw } from 'lucide-react';

interface LessonUpdateWatcherProps {
    lessonId: string;
    initialUpdatedAt: Date;
}

export default function LessonUpdateWatcher({ lessonId, initialUpdatedAt }: LessonUpdateWatcherProps) {
    const router = useRouter();
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string>(new Date(initialUpdatedAt).toISOString());

    useEffect(() => {
        const checkInterval = setInterval(async () => {
            try {
                const latestUpdatedAt = await checkLessonUpdate(lessonId);

                if (latestUpdatedAt && latestUpdatedAt !== lastUpdatedAt) {
                    setLastUpdatedAt(latestUpdatedAt);

                    toast.custom((t) => (
                        <div
                            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                                } max-w-md w-full bg-[#0f172a] border border-[var(--primary)]/50 shadow-lg shadow-[var(--primary)]/10 rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                        >
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <RefreshCw className="h-10 w-10 text-[var(--primary)] animate-spin-slow" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-white">
                                            Lesson Updated
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            The content of this lesson has been updated by an admin.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-[var(--border-color)]">
                                <button
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        router.refresh();
                                    }}
                                    className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 focus:outline-none transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    ), {
                        duration: Infinity, // Stay until clicked
                        position: 'top-right',
                    });
                }
            } catch (error) {
                console.error('Failed to check for lesson updates:', error);
            }
        }, 15000); // Check every 15 seconds

        return () => clearInterval(checkInterval);
    }, [lessonId, lastUpdatedAt, router]);

    return null; // This component is invisible
}
