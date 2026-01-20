'use client';

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
    youtubeUrl?: string;
    videoUrl?: string;
    onComplete?: () => void;
}

export default function VideoPlayer({ youtubeUrl, videoUrl, onComplete }: VideoPlayerProps) {
    // 1. Prioritize videoUrl (direct file), then youtubeUrl
    const rawSrc = videoUrl || youtubeUrl || "";

    // 2. Simple URL formatting (ensure protocol)
    let src = rawSrc;
    if (src && !src.startsWith('http') && (src.includes('youtube.com') || src.includes('youtu.be'))) {
        src = `https://${src}`;
    }

    const [error, setError] = useState(false);

    if (!src) {
        return (
            <div className="aspect-video bg-[var(--background-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-color)]">
                <p className="text-[var(--text-muted)]">No video source provided</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="aspect-video bg-[var(--background-secondary)] rounded-2xl flex flex-col items-center justify-center border border-red-500/20 gap-4">
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
            {/* 3. Container: removed 'overflow-hidden' which can clip controls in some layouts, but kept rounding */}
            <div className="group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <MediaPlayer
                    title="Lesson Video"
                    src={src}
                    load="eager"
                    crossOrigin
                    playsInline
                    onEnd={() => onComplete?.()}
                    onError={(e) => {
                        console.error("Video Error:", e);
                        setError(true);
                    }}
                    // 4. Critical Fix: Force object-contain to prevent "Zoom" effect on iframes/videos
                    className="w-full h-full [&_video]:object-contain [&_iframe]:subpixel-antialiased"
                >
                    <MediaProvider>
                        {/* Poster mainly for direct videos, can be passed if we had a thumbnail property */}
                    </MediaProvider>

                    {/* Default Layout */}
                    <DefaultVideoLayout icons={defaultLayoutIcons} />
                </MediaPlayer>
            </div>
        </div>
    );
}
