import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Wrench, Briefcase, Rocket, Lock, ChevronRight, Trophy, Flame, Target } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getTracks } from '@/lib/tracks';
import { getLastActiveLesson } from '@/lib/user-progress';
import { Card } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import clsx from 'clsx';

const iconMap: Record<string, typeof Wrench> = {
    wrench: Wrench,
    briefcase: Briefcase,
    rocket: Rocket,
};

export default async function DashboardPage() {
    const session = await auth();
    const userName = session?.user?.name?.split(' ')[0] || 'Learner';
    const userId = session?.user?.id;

    if (!userId) return null; // Should be handled by layout but just in case

    // Fetch tracks
    const tracks = await getTracks(userId);

    // Fetch user stats
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true }
    });
    const userPoints = user?.points || 0;

    // Get last active lesson
    const lastLesson = await getLastActiveLesson(userId);

    const stats = {
        totalPoints: userPoints,
        streak: 0, // TODO: Implement streak
        rank: 0,  // TODO: Implement leaderboard
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">
                    Selamat datang kembali, <span className="text-gradient">{userName}</span>!
                </h1>
                <p className="text-[var(--text-secondary)]">
                    Lanjutkan perjalanan belajar Anda dari tempat terakhir.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</p>
                        <p className="text-sm text-[var(--text-muted)]">Total Poin</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-[var(--warning)]" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stats.streak} hari</p>
                        <p className="text-sm text-[var(--text-muted)]">Streak Saat Ini</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--success)]/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-[var(--success)]" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">#{stats.rank || '-'}</p>
                        <p className="text-sm text-[var(--text-muted)]">Peringkat</p>
                    </div>
                </Card>
            </div>

            {/* Continue Learning */}
            {lastLesson && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Lanjutkan Belajar</h2>
                    <Card className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                                    <Wrench className="w-8 h-8 text-[var(--primary)]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[var(--primary-light)] mb-1">
                                        {(lastLesson as any).module.track.name} • {(lastLesson as any).module.name}
                                    </p>
                                    <h3 className="text-lg font-bold">{lastLesson.title}</h3>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Lesson {(lastLesson as any).orderIndex + 1}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/lessons/${lastLesson.id}`}
                                className={clsx(buttonVariants.base, buttonVariants.variants.primary, buttonVariants.sizes.md)}
                            >
                                Lanjut
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </Card>
                </div>
            )}

            {/* Learning Tracks */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Track Pembelajaran Anda</h2>
                    <Link
                        href="/tracks"
                        className="text-sm text-[var(--primary-light)] hover:text-[var(--primary)] flex items-center gap-1 transition"
                    >
                        Lihat Semua
                        <ChevronRight className="w-4 h-4" />
                    </Link>
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
        </div>
    );
}
