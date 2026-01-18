'use client';

import { useEffect, useRef, useState } from 'react';
import { getYouTubeId } from '@/lib/utils';

interface VideoPlayerProps {
    youtubeUrl: string;
    onComplete?: () => void;
}

declare global {
    interface Window {
        YT: {
            Player: new (
                elementId: string,
                config: {
                    videoId: string;
                    playerVars?: Record<string, string | number>;
                    events?: {
                        onReady?: (event: { target: YTPlayer }) => void;
                        onStateChange?: (event: { data: number }) => void;
                    };
                }
            ) => YTPlayer;
            PlayerState: {
                ENDED: number;
                PLAYING: number;
                PAUSED: number;
            };
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}

interface YTPlayer {
    getCurrentTime: () => number;
    getDuration: () => number;
    playVideo: () => void;
    pauseVideo: () => void;
    destroy: () => void;
}

export default function VideoPlayer({ youtubeUrl, videoUrl, onComplete }: VideoPlayerProps & { videoUrl?: string }) {
    // 1. Handle Native HTML5 Video
    if (videoUrl) {
        return (
            <div className="space-y-3">
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    <video
                        src={videoUrl}
                        controls
                        className="w-full h-full"
                        onEnded={onComplete}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        );
    }

    // 2. Handle YouTube
    const playerRef = useRef<YTPlayer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const videoId = youtubeUrl ? getYouTubeId(youtubeUrl) : null;

    useEffect(() => {
        if (!videoId) return;

        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const initPlayer = () => {
            if (!videoId || !containerRef.current) return;

            playerRef.current = new window.YT.Player('youtube-player', {
                videoId,
                playerVars: {
                    autoplay: 0,
                    modestbranding: 1,
                    rel: 0,
                },
                events: {
                    onReady: () => setIsReady(true),
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            onComplete?.();
                        }
                    },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        // Track progress
        const progressInterval = setInterval(() => {
            if (playerRef.current && isReady) {
                const currentTime = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                if (duration > 0) {
                    setProgress((currentTime / duration) * 100);
                }
            }
        }, 1000);

        return () => {
            clearInterval(progressInterval);
            playerRef.current?.destroy();
        };
    }, [videoId, isReady, onComplete]);

    if (!videoId) {
        return (
            <div className="aspect-video bg-[var(--background-secondary)] rounded-xl flex items-center justify-center">
                <p className="text-[var(--text-muted)]">Invalid video source</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div
                ref={containerRef}
                className="aspect-video bg-[var(--background-secondary)] rounded-xl overflow-hidden shadow-2xl relative z-0"
            >
                <div id="youtube-player" className="w-full h-full" />
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 progress-bar h-1.5 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
    );
}
