'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import ReactPlayer to avoid hydration mismatch issues
const ReactPlayer = dynamic(() => import("react-player"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-black/5">
            <Loader2 className="w-8 h-8 text-[var(--text-muted)] animate-spin" />
        </div>
    )
});

interface VideoPlayerProps {
    youtubeUrl?: string;
    videoUrl?: string;
    onComplete?: () => void;
}

export default function VideoPlayer({ youtubeUrl, videoUrl, onComplete }: VideoPlayerProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // 1. Prioritize videoUrl (direct file), then youtubeUrl
    const rawSrc = videoUrl || youtubeUrl || "";

    // 2. Simple URL formatting (ensure protocol)
    let src = rawSrc;
    if (src && !src.startsWith('http') && (src.includes('youtube.com') || src.includes('youtu.be'))) {
        src = `https://${src}`;
    }

    if (!hasMounted) {
        return (
            <div className="w-full max-w-4xl mx-auto aspect-video bg-[var(--background-secondary)] rounded-xl animate-pulse flex items-center justify-center border border-[var(--border-color)]">
                <Loader2 className="w-8 h-8 text-[var(--text-muted)] animate-spin" />
            </div>
        );
    }

    if (!src) {
        return (
            <div className="w-full max-w-4xl mx-auto aspect-video bg-[var(--background-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-color)]">
                <p className="text-[var(--text-muted)]">No video source provided</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto aspect-video bg-[var(--background-secondary)] rounded-2xl flex flex-col items-center justify-center border border-red-500/20 gap-4">
                <p className="text-red-400 font-medium">Failed to load video</p>
                <button
                    onClick={() => setError(false)}
                    className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--primary)]/10 border border-[var(--border-color)] rounded-lg text-sm transition-colors text-[var(--text-primary)]"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <ReactPlayer
                    url={src}
                    width="100%"
                    height="100%"
                    controls={true}
                    onEnded={() => onComplete?.()}
                    onError={(e: any) => {
                        console.error("Video Error:", e);
                        setError(true);
                    }}
                    config={{
                        youtube: {
                            playerVars: { showinfo: 1 }
                        }
                    }}
                />
            </div>
        </div>
    );
}
