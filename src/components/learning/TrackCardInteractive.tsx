'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import clsx from 'clsx';
import { Lock, Wrench, Briefcase, Rocket, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import { useState } from 'react';

const iconMap: Record<string, typeof Wrench> = {
    wrench: Wrench,
    briefcase: Briefcase,
    rocket: Rocket,
};

interface TrackCardProps {
    track: any;
}

export default function TrackCardInteractive({ track }: TrackCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const Icon = iconMap[track.icon] || Wrench;
    const color = track.slug === 'engineer' ? 'var(--primary)' : track.slug === 'entrepreneur' ? 'var(--success)' : 'var(--warning)';

    // Get top 5 items (lessons from modules)
    const previewItems = track.modules
        .flatMap((m: any) => m.lessons.map((l: any) => ({ ...l, moduleName: m.name })))
        .slice(0, 5);

    return (
        <Card className={clsx(
            "p-6 group relative overflow-visible h-full transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
            track.isLocked && 'cursor-not-allowed opacity-70'
        )}>
            {/* Lock Overlay */}
            {track.isLocked && (
                <div className="absolute inset-0 bg-[var(--background)]/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-[15px]">
                    <Lock className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                    <p className="text-sm text-[var(--text-muted)] text-center px-4">
                        {track.lockReason || 'Complete previous track'}
                    </p>
                </div>
            )}

            {/* Header / Click Area for Expansion */}
            <div
                className={clsx("cursor-pointer", track.isLocked && "pointer-events-none")}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-start">
                    {/* Track Icon */}
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition group-hover:scale-110"
                        style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
                    >
                        <Icon className="w-7 h-7" style={{ color }} />
                    </div>
                </div>

                {/* Track Info */}
                <h3 className="text-lg font-bold mb-2">{track.name}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                    {track.description}
                </p>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Progres</span>
                        <span className="font-medium">{track.progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${track.progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
                        <span>{track.completedLessons} dari {track.totalLessons} pelajaran</span>
                        <ChevronDown className={clsx("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                    </div>
                </div>
            </div>

            {/* Dropdown Content */}
            <div className={clsx(
                "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
                isExpanded ? "max-h-96 opacity-100 mt-4 border-t border-[var(--border-color)] pt-4" : "max-h-0 opacity-0"
            )}>
                <div className="space-y-2 mb-4">
                    {previewItems.map((item: any, idx: number) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] py-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                            <span className="truncate flex-1">{item.title}</span>
                        </div>
                    ))}
                    {track.totalLessons > 5 && (
                        <p className="text-xs text-[var(--text-muted)] pl-4">... dan {track.totalLessons - 5} lainnya</p>
                    )}
                </div>

                <Link
                    href={track.isLocked ? '#' : `/tracks/${track.slug}`}
                    className="w-full"
                    onClick={(e) => track.isLocked && e.preventDefault()}
                >
                    <button className="w-full py-2 bg-[var(--background-card)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border-color)] hover:border-[var(--primary)] rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                        Lihat Detail
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </Link>
            </div>
        </Card>
    );
}
