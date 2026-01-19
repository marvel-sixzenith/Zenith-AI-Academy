'use client';

import { useState, useEffect, useRef, useCallback, ComponentType } from 'react';
import dynamic from 'next/dynamic';
import {
    Loader2,
    Play,
    Pause,
    Volume2,
    Volume1,
    VolumeX,
    Maximize,
    Minimize,
    Settings,
    SkipBack,
    SkipForward
} from 'lucide-react';

// Define minimal props interface since it's not exported reliably
interface ReactPlayerProps {
    url?: string;
    playing?: boolean;
    loop?: boolean;
    controls?: boolean;
    light?: boolean | string;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    progressInterval?: number;
    playsinline?: boolean;
    pip?: boolean;
    stopOnUnmount?: boolean;
    fallback?: React.ReactElement;
    wrapper?: any;
    onReady?: (player: any) => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onBuffer?: () => void;
    onBufferEnd?: () => void;
    onEnded?: () => void;
    onError?: (error: any, data?: any, hlsInstance?: any, hlsGlobal?: any) => void;
    onDuration?: (duration: number) => void;
    onSeek?: (seconds: number) => void;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
    config?: any;
    className?: string;
    ref?: any;
}

// Dynamically import ReactPlayer without SSR
const ReactPlayer = dynamic(() => import('react-player'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-black/90">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    )
}) as ComponentType<ReactPlayerProps>;

interface VideoPlayerProps {
    youtubeUrl?: string;
    videoUrl?: string;
    onComplete?: () => void;
}

const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
        return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
};

export default function VideoPlayer({ youtubeUrl, videoUrl, onComplete }: VideoPlayerProps) {
    const [hasWindow, setHasWindow] = useState(false);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // State
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [loaded, setLoaded] = useState(0); // Buffered
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [isBuffering, setIsBuffering] = useState(false);

    const url = videoUrl || youtubeUrl;

    useEffect(() => {
        setHasWindow(true);

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (playing && !isBuffering) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    const togglePlay = useCallback(() => {
        setPlaying((prev) => !prev);
    }, []);

    const toggleMute = () => {
        setMuted((prev) => !prev);
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            try {
                await containerRef.current.requestFullscreen();
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setMuted(newVolume === 0);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSeeking(true);
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseUp = () => {
        setSeeking(false);
        if (playerRef.current) {
            playerRef.current.seekTo(played);
        }
    };

    const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
        if (!seeking) {
            setPlayed(state.played);
            setLoaded(state.loaded);
        }
    };

    if (!hasWindow) {
        return <div className="aspect-video bg-black/10 rounded-2xl animate-pulse" />;
    }

    if (!url) {
        return (
            <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                <p className="text-slate-400">No video source provided</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-red-500/20 gap-4">
                <p className="text-red-400 font-medium">{error}</p>
                <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors text-white"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div
                ref={containerRef}
                className={`group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all duration-300 ${isFullscreen ? 'rounded-none ring-0' : 'hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]'}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => playing && setShowControls(false)}
            >
                {/* Video Layer - Explicit Z-0 */}
                <div className="absolute inset-0 z-0">
                    <ReactPlayer
                        ref={playerRef}
                        url={url}
                        width="100%"
                        height="100%"
                        playing={playing}
                        volume={volume}
                        muted={muted}
                        playbackRate={playbackRate}
                        playsinline={true}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                        onProgress={handleProgress}
                        onDuration={setDuration}
                        onBuffer={() => setIsBuffering(true)}
                        onBufferEnd={() => setIsBuffering(false)}
                        onPlay={() => {
                            setIsBuffering(false);
                            setPlaying(true);
                        }}
                        onPause={() => setPlaying(false)}
                        onEnded={() => {
                            setPlaying(false);
                            setShowControls(true);
                            onComplete?.();
                        }}
                        onError={(e) => {
                            console.error("Video Player Error:", e);
                            setError("Failed to load video.");
                        }}
                        config={{
                            youtube: {
                                playerVars: { showinfo: 0, controls: 0, modestbranding: 1, rel: 0 },
                                embedOptions: { origin: typeof window !== 'undefined' ? window.location.origin : '' }
                            } as any
                        }}
                    />
                </div>

                {/* Gradient Overlay - Z-10 */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-10" />

                {/* Click Overlay (Play/Pause) - Z-20 */}
                <div
                    className="absolute inset-0 z-20"
                    onClick={togglePlay}
                    onDoubleClick={toggleFullscreen}
                />

                {/* Centered Loading/Play State - Z-30 */}
                <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                    {isBuffering ? (
                        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-full">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                    ) : !playing && (
                        <div className={`transition-all duration-300 ${!playing ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-full ring-1 ring-white/20 shadow-2xl">
                                <Play className="w-10 h-10 text-white fill-white ml-1" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Overlay - Z-40 */}
                <div
                    className={`absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-20 pb-4 px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="relative group/seeker w-full h-1 cursor-pointer touch-none flex items-center">
                            {/* Background Track */}
                            <div className="absolute w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                {/* Buffered Bar */}
                                <div
                                    className="absolute top-0 left-0 h-full bg-white/30 transition-all duration-300"
                                    style={{ width: `${loaded * 100}%` }}
                                />
                            </div>

                            {/* Played Bar */}
                            <div
                                className="absolute left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100 group-hover/seeker:h-1.5"
                                style={{ width: `${played * 100}%` }}
                            />

                            {/* Scrubber Input */}
                            <input
                                type="range"
                                min={0}
                                max={0.999999}
                                step="any"
                                value={played}
                                onMouseDown={() => setSeeking(true)}
                                onChange={handleSeekChange}
                                onMouseUp={handleSeekMouseUp}
                                onTouchEnd={handleSeekMouseUp} // For mobile
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                            />

                            {/* Thumb (Visual only) */}
                            <div
                                className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none transition-all duration-150 scale-0 group-hover/seeker:scale-100"
                                style={{ left: `${played * 100}%`, transform: `translateX(-50%) scale(${seeking ? 1 : ''})` }}
                            />
                        </div>

                        {/* Bottom Row Controls */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* Play/Pause */}
                                <button
                                    onClick={togglePlay}
                                    className="text-white/90 hover:text-white hover:scale-110 transition-all"
                                >
                                    {playing ? <Pause size={24} className="fill-white/90" /> : <Play size={24} className="fill-white/90" />}
                                </button>

                                {/* Volume */}
                                <div className="group/volume flex items-center gap-2">
                                    <button
                                        onClick={toggleMute}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        {muted || volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
                                    </button>
                                    <div className="w-0 overflow-hidden transition-all duration-300 group-hover/volume:w-20 pl-1">
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            value={muted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="text-xs font-medium font-mono text-white/70">
                                    <span>{formatTime(duration * played)}</span>
                                    <span className="mx-1 opacity-50">/</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Settings (Future use) */}
                                {/* <button className="text-white/70 hover:text-white transition-colors">
                                    <Settings size={18} />
                                </button> */}

                                {/* Fullscreen */}
                                <button
                                    onClick={toggleFullscreen}
                                    className="text-white/80 hover:text-white hover:scale-110 transition-all"
                                >
                                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
