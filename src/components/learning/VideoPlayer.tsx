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
    const [src, setSrc] = useState(videoUrl || youtubeUrl || "");

    useEffect(() => {
        const rawSrc = videoUrl || youtubeUrl || "";
        if ((rawSrc.includes('youtube.com') || rawSrc.includes('youtu.be')) && typeof window !== 'undefined') {
            try {
                const urlObj = new URL(rawSrc);
                urlObj.searchParams.set('origin', window.location.origin);
                // Also force empty widget_referrer to avoid leaking strict referrer policies if any
                urlObj.searchParams.set('widget_referrer', window.location.origin);
                setSrc(urlObj.toString());
            } catch (e) {
                setSrc(rawSrc);
            }
        } else {
            setSrc(rawSrc);
        }
    }, [videoUrl, youtubeUrl]);

    // We can still handle basic errors or loading states if needed, 
    // but Vidstack handles most internally.
    const [error, setError] = useState(false);

    if (!src) {
        return (
            <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                <p className="text-slate-400">No video source provided</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-red-500/20 gap-4">
                <p className="text-red-400 font-medium">Failed to load video</p>
                <button onClick={() => setError(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors text-white">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <MediaPlayer
                    title="Lesson Video"
                    src={src}
                    load="eager"
                    crossOrigin
                    playsInline
                    onEnd={() => onComplete?.()}
                    onError={() => setError(true)}
                    className="w-full h-full"
                >
                    <MediaProvider>
                        <div className="vds-poster w-full h-full absolute inset-0 block" /> {/* Placeholder/Poster */}
                        {/* Custom Loading State if desired, essentially overlays */}
                    </MediaProvider>

                    {/* The Default CSS Layout */}
                    <DefaultVideoLayout icons={defaultLayoutIcons} />
                </MediaPlayer>
            </div>
        </div>
    );
}
