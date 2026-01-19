'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Play } from 'lucide-react';
import type ReactPlayerType from 'react-player';

// Dynamically import ReactPlayer without SSR
const ReactPlayer = dynamic(() => import('react-player'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-black/20">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
        </div>
    )
}) as typeof ReactPlayerType;

interface VideoPlayerProps {
    youtubeUrl?: string;
    videoUrl?: string;
    onComplete?: () => void;
}

export default function VideoPlayer({ youtubeUrl, videoUrl, onComplete }: VideoPlayerProps) {
    const [hasWindow, setHasWindow] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const url = videoUrl || youtubeUrl;

    useEffect(() => {
        setHasWindow(true);
    }, []);

    if (!hasWindow) {
        return (
            <div className="aspect-video bg-[var(--background-secondary)] rounded-2xl animate-pulse" />
        );
    }

    if (!url) {
        return (
            <div className="aspect-video bg-[var(--background-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-color)]">
                <p className="text-[var(--text-muted)]">No video source provided</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="aspect-video bg-[var(--background-secondary)] rounded-2xl flex flex-col items-center justify-center border border-red-500/20 gap-4">
                <p className="text-red-400 font-medium">{error}</p>
                <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-[var(--background-card)] hover:bg-[var(--background-secondary)] rounded-lg text-sm transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Player Container */}
            <div className="group relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-10" />

                <ReactPlayer
                    url={url}
                    width="100%"
                    height="100%"
                    controls
                    playing={isPlaying}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onProgress={(state) => setProgress(state.played * 100)}
                    onEnded={() => {
                        setIsPlaying(false);
                        onComplete?.();
                    }}
                    onError={(e) => {
                        console.error("Video Player Error:", e);
                        setError("Failed to load video. Please check the source.");
                    }}
                    className="absolute top-0 left-0"
                    style={{ borderRadius: '1rem', overflow: 'hidden' }}
                    config={{
                        youtube: {
                            embedOptions: { origin: typeof window !== 'undefined' ? window.location.origin : '' }
                        },
                        file: {
                            attributes: {
                                controlsList: 'nodownload',
                                crossOrigin: 'anonymous'
                            }
                        }
                    }}
                />
            </div>

            {/* Progress Indicator */}
            <div className="bg-[var(--background-card)] border border-[var(--border-color)] p-4 rounded-xl flex items-center gap-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                    {isPlaying ? (
                        <div className="flex gap-1">
                            <div className="w-1 h-3 bg-current rounded-full animate-[bounce_1s_infinite]" />
                            <div className="w-1 h-3 bg-current rounded-full animate-[bounce_1s_infinite_0.2s]" />
                            <div className="w-1 h-3 bg-current rounded-full animate-[bounce_1s_infinite_0.4s]" />
                        </div>
                    ) : (
                        <Play size={18} className="ml-1" />
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-[var(--text-secondary)]">Progress</span>
                        <span className="text-[var(--primary-light)]">{Math.round(progress)}% Completed</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--background-secondary)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] transition-all duration-300 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-[20px] bg-gradient-to-r from-transparent to-white/30 blur-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
