import { auth } from '@/lib/auth';
import { getTracks } from '@/lib/tracks';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import clsx from 'clsx';
import { Lock, Wrench, Briefcase, Rocket, ChevronRight } from 'lucide-react';

const iconMap: Record<string, typeof Wrench> = {
    wrench: Wrench,
    briefcase: Briefcase,
    rocket: Rocket,
};

export default async function TracksPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return null;
    }

    const tracks = await getTracks(userId);

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Track Pembelajaran</h1>
                <p className="text-[var(--text-secondary)]">
                    Pilih jalur pembelajaran yang sesuai dengan tujuan karir Anda.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {tracks.map((track: any) => {
                    const Icon = iconMap[track.icon] || Wrench;
                    const color = track.slug === 'engineer' ? 'var(--primary)' : track.slug === 'entrepreneur' ? 'var(--success)' : 'var(--warning)';

                    return (
                        <Link
                            key={track.id}
                            href={track.isLocked ? '#' : `/tracks/${track.slug}`}
                        >
                            <Card className={clsx(
                                "p-6 group relative overflow-hidden h-full transition-all duration-300",
                                track.isLocked ? 'cursor-not-allowed opacity-70' : 'hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
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
                                        <span className="text-[var(--text-muted)]">Progres</span>
                                        <span className="font-medium">{track.progress}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${track.progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {track.completedLessons} dari {track.totalLessons} pelajaran
                                    </p>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
