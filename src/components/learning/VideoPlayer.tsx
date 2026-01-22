import { useRef, useEffect, useState } from 'react'; // Added useState
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

    // 2. Format URL
    let src = rawSrc;
    // Add https to youtube links if missing
    if (src && !src.startsWith('http') && (src.includes('youtube.com') || src.includes('youtu.be'))) {
        src = `https://${src}`;
    }

    if (!mounted) {
        return (
            <div className="w-full max-w-4xl mx-auto aspect-video bg-[var(--background-secondary)] rounded-xl flex items-center justify-center border border-[var(--border-color)]">
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

    return (
        <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
            <MediaPlayer
                ref={player}
                src={src}
                aspectRatio="16/9"
                onEnd={() => onComplete?.()}
                className="w-full h-full"
            >
                <MediaProvider />
                <DefaultVideoLayout icons={defaultLayoutIcons} />
            </MediaPlayer>
        </div>
    );
}
