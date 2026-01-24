'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LessonErrorFallbackProps {
    error: any;
    resetErrorBoundary: () => void;
}

export default function LessonErrorFallback({ error, resetErrorBoundary }: LessonErrorFallbackProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl text-center min-h-[400px]">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md">
                We encountered an error while loading this lesson content.
                <br />
                <span className="text-xs text-[var(--text-muted)] mt-2 block font-mono bg-[var(--background)] p-1 rounded">
                    {error.message || 'Unknown error'}
                </span>
            </p>

            <div className="flex gap-4">
                <button
                    onClick={resetErrorBoundary}
                    className="btn-primary flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-secondary flex items-center gap-2"
                >
                    <Home className="w-4 h-4" />
                    Dashboard
                </button>
            </div>
        </div>
    );
}
