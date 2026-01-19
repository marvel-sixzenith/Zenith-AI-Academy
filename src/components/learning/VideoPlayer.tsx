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
    if (!seconds || isNaN(seconds)) return "00:00";
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
        return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
};

const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
};

export default function VideoPlayer({ youtubeUrl, videoUrl, onComplete }: VideoPlayerProps) {
    const [hasWindow, setHasWindow] = useState(false);

    // Refs
    const playerRef = useRef<any>(null); // For ReactPlayer (YouTube)
    const videoRef = useRef<HTMLVideoElement>(null); // For Native Video
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // State Refs (to avoid stale closures in event listeners)
    const seekingRef = useRef(false);

    // Determines Source Type
    const url = videoUrl || youtubeUrl || "";
    const isYouTube = isYouTubeUrl(url);

    // State
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0); // 0 to 1
    const [loaded, setLoaded] = useState(0); // 0 to 1 (Buffered)
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [isBuffering, setIsBuffering] = useState(false);

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

    // Native Video Event Listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!isYouTube && video) {
            const updateTime = () => {
                if (!seekingRef.current) {
                    setPlayed(video.currentTime / video.duration || 0);
                    // Native video buffering
                    if (video.buffered.length > 0) {
                        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                        setLoaded(bufferedEnd / video.duration || 0);
                    }
                }
            };
            const handleDuration = () => setDuration(video.duration);
            const handleEnded = () => {
                setPlaying(false);
                setShowControls(true);
                if (onComplete) onComplete();
            };
            const handleWaiting = () => setIsBuffering(true);
            const handlePlaying = () => setIsBuffering(false);
            const handleError = (e: any) => {
                console.error("Native Video Error", e);
                setError("Failed to load video.");
            };

            video.addEventListener('timeupdate', updateTime);
            video.addEventListener('loadedmetadata', handleDuration);
            video.addEventListener('ended', handleEnded);
            video.addEventListener('waiting', handleWaiting);
            video.addEventListener('playing', handlePlaying);
            video.addEventListener('error', handleError);

            return () => {
                video.removeEventListener('timeupdate', updateTime);
                video.removeEventListener('loadedmetadata', handleDuration);
                video.removeEventListener('ended', handleEnded);
                video.removeEventListener('waiting', handleWaiting);
                video.removeEventListener('playing', handlePlaying);
                video.removeEventListener('error', handleError);
            };
        }
    }, [isYouTube, onComplete]); // Removed seeking dependency

    // Apply Volume/Mute to Native Video
    useEffect(() => {
        if (!isYouTube && videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = muted;
        }
    }, [volume, muted, isYouTube]);

    // Apply Play/Pause to Native Video
    useEffect(() => {
        if (!isYouTube && videoRef.current) {
            if (playing) {
                videoRef.current.play().catch(e => console.error("Play failed", e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [playing, isYouTube]);


    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (playing) {
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
            } catch (err) { console.error("Fullscreen error", err); }
        } else {
            if (document.exitFullscreen) await document.exitFullscreen();
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setMuted(newVolume === 0);
    };

    // Seek Handler
    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPlayed = parseFloat(e.target.value);
        setPlayed(newPlayed);
        seekingRef.current = true;

        // Live seek for Native Video
        if (!isYouTube && videoRef.current) {
            videoRef.current.currentTime = newPlayed * duration;
        }
    };

    const handleSeekMouseUp = (e: any) => {
        seekingRef.current = false;

        // For ReactPlayer (YouTube)
        if (isYouTube && playerRef.current) {
            playerRef.current.seekTo(played, 'fraction');
        }
        // For Native Video
        else if (!isYouTube && videoRef.current) {
            videoRef.current.currentTime = played * duration;
        }
    };

    // ReactPlayer Progress (YouTube only)
    const handleReactPlayerProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
        if (!seekingRef.current) {
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
                <div className="flex gap-2">
                    <button onClick={() => { setError(null); setPlaying(true); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors text-white">
                        Retry
                    </button>
                    {isYouTube && (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors text-white">
                            Open in YouTube
                        </a>
                    )}
                </div>
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
                {/* --- VIDEO LAYER (Z-0) --- */}
                <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
                    {isYouTube ? (
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
                            onProgress={handleReactPlayerProgress}
                            onDuration={setDuration}
                            onBuffer={() => setIsBuffering(true)}
                            onBufferEnd={() => setIsBuffering(false)}
                            onPlay={() => { setIsBuffering(false); setPlaying(true); }}
                            onPause={() => setPlaying(false)}
                            onEnded={() => { setPlaying(false); setShowControls(true); if (onComplete) onComplete(); }}
                            onError={(e) => { console.error("YouTube Error:", e); setError("Failed to load video."); }}
                            config={{
                                youtube: {
                                    playerVars: { showinfo: 0, controls: 0, modestbranding: 1, rel: 0, origin: typeof window !== 'undefined' ? window.location.origin : '' },
                                } as any
                            }}
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            src={url}
                            className="w-full h-full object-contain"
                            playsInline
                            onClick={togglePlay} // Native click to play helper
                        />
                    )}
                </div>

                {/* --- OVERLAYS --- */}

                {/* 1. Play/Pause Click Overlay (Z-10) */}
                <div
                    className="absolute inset-0 z-10"
                    onClick={togglePlay}
                    onDoubleClick={toggleFullscreen}
                />

                {/* 2. Gradient Overlay (Z-20) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20" />

                {/* 3. Centered Loading/Play Icon (Z-30) */}
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

                {/* 4. Controls Bar (Z-40) */}
                <div
                    className={`absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-20 pb-4 px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={(e) => e.stopPropagation()} // Prevent click-through to togglePlay
                >
                    <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="relative group/seeker w-full h-1 cursor-pointer touch-none flex items-center">
                            {/* Track */}
                            <div className="absolute w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                {/* Buffered */}
                                <div
                                    className="absolute top-0 left-0 h-full bg-white/30 transition-all duration-300"
                                    style={{ width: `${loaded * 100}%` }}
                                />
                            </div>
                            {/* Played */}
                            <div
                                className="absolute left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100 group-hover/seeker:h-1.5"
                                style={{ width: `${played * 100}%` }}
                            />
                            {/* Input */}
                            <input
                                type="range"
                                min={0}
                                max={0.999999}
                                step="any"
                                value={played}
                                onMouseDown={() => { seekingRef.current = true; }}
                                onChange={handleSeekChange}
                                onMouseUp={handleSeekMouseUp}
                                onTouchEnd={handleSeekMouseUp} // For mobile
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                            />
                            {/* Thumb */}
                            <div
                                className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none transition-all duration-150 scale-0 group-hover/seeker:scale-100"
                                style={{ left: `${played * 100}%`, transform: `translateX(-50%) scale(${seekingRef.current ? 1 : ''})` }}
                            />
                        </div>

                        {/* Controls Row */}
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
