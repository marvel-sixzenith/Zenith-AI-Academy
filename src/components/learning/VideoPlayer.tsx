'use client';
import { useRef, useEffect, useState } from 'react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import type { MediaPlayerInstance } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import { Loader2 } from 'lucide-react';

// Styles are already imported in globals.css

interface VideoPlayerProps {
    youtubeUrl?: string; // Kept for prop compatibility
    videoUrl?: string;
    onComplete?: () => void;
}

export default function VideoPlayer({ youtubeUrl, videoUrl, onComplete }: VideoPlayerProps) {
    const player = useRef<MediaPlayerInstance>(null);
    const [mounted, setMounted] = useState(false); // Fix hydration mismatch

    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. Determine Source
    // Vidstack handles youtube/file automatically via `src` prop
    const rawSrc = videoUrl || youtubeUrl || "";

    // 2. Determine if it's a YouTube link
    let isYoutube = false;
    let youtubeId = "";

    if (rawSrc) {
        // Regex to extract YouTube ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = rawSrc.match(regExp);
        if (match && match[2].length === 11) {
            isYoutube = true;
            youtubeId = match[2];
        }
    }

    if (!mounted) {
        return (
            <div className="w-full max-w-4xl mx-auto aspect-video bg-[var(--background-secondary)] rounded-xl flex items-center justify-center border border-[var(--border-color)]">
                <Loader2 className="w-8 h-8 text-[var(--text-muted)] animate-spin" />
            </div>
        );
    }

    if (!rawSrc) {
        return (
            <div className="w-full max-w-4xl mx-auto aspect-video bg-[var(--background-secondary)] rounded-2xl flex items-center justify-center border border-[var(--border-color)]">
                <p className="text-[var(--text-muted)]">No video source provided</p>
            </div>
        );
    }

    // fallback for YouTube to avoid "Sign in" bot error in Brave
    // We use a "Facade" pattern: Show thumbnail first, load iframe only on click.
    // This prevents the bot check from triggering on initial page load.
    const [showYoutube, setShowYoutube] = useState(false);

    if (isYoutube) {
        if (!showYoutube) {
            return (
                <div
                    className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black aspect-video relative group cursor-pointer"
                    onClick={() => setShowYoutube(true)}
                >
                    <img
                        src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={(e) => {
                            // Fallback to hqdefault if maxres doesn't exist
                            const target = e.target as HTMLImageElement;
                            target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black aspect-video">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
            <MediaPlayer
                key={rawSrc}
                ref={player}
                src={rawSrc}
                title="Lesson Video"
                playsInline
                load="eager"
                crossOrigin="anonymous"
                storage="video-player-storage"
                onEnd={() => onComplete?.()}
                className="w-full h-full"
            >
                <MediaProvider />
                <DefaultVideoLayout icons={defaultLayoutIcons} />
            </MediaPlayer>
        </div>
    );
}
