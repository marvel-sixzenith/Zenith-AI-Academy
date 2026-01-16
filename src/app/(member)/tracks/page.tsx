import Link from 'next/link';
import { Wrench, Briefcase, Rocket, Lock, ChevronRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getTracks } from '@/lib/tracks';

const iconMap: Record<string, typeof Wrench> = {
    wrench: Wrench,
    briefcase: Briefcase,
    rocket: Rocket,
};

export default async function TracksPage() {
    // Fetch tracks directly
    const session = await auth();
    const tracks = await getTracks(session?.user?.id);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Learning Tracks</h1>
                <p className="text-[var(--text-secondary)]">
                    Choose your path and start your journey to mastering AI automation.
                </p>
            </div>

            {/* Tracks Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tracks.map((track: any) => {
                    const Icon = iconMap[track.icon] || (track.slug === 'engineer' ? Wrench : track.slug === 'entrepreneur' ? Briefcase : Rocket);
                    const isLocked = !!track.prerequisiteTrackId && track.completedLessons < track.totalLessons;
                    const color = track.slug === 'engineer' ? 'var(--primary)' : track.slug === 'entrepreneur' ? 'var(--success)' : 'var(--warning)';

                    return (
                        <Link
                            key={track.id}
                            href={isLocked ? '#' : `/tracks/${track.slug}`}
                            className={`glass-card p-6 group relative overflow-hidden ${isLocked ? 'cursor-not-allowed opacity-70' : ''
                                }`}
                        >
                            {/* Lock Overlay */}
                            {isLocked && (
                                <div className="absolute inset-0 bg-[var(--background)]/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-[15px]">
                                    <Lock className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                                    <p className="text-sm text-[var(--text-muted)] text-center px-4">
                                        Complete previous track to unlock
                                    </p>
                                </div>
                            )}

                            {/* Track Icon */}
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition group-hover:scale-110"
                                style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
                            >
                                <Icon className="w-7 h-7" style={{ color }} />
                            </div>

                            {/* Track Info */}
                            <h3 className="text-lg font-bold mb-2">{track.name}</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                                {track.description}
                            </p>

                            {/* Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">Progress</span>
                                    <span className="font-medium">{track.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${track.progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {track.completedLessons} of {track.totalLessons} lessons
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
