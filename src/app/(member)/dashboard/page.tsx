import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Wrench, Briefcase, Rocket, Lock, ChevronRight, Trophy, Flame, Target } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getTracks } from '@/lib/tracks';
import { getLastActiveLesson } from '@/lib/user-progress';
import { Card } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import clsx from 'clsx';
import TrackCardInteractive from '@/components/learning/TrackCardInteractive';
import { checkAndUpdateStreak } from '@/lib/user-streaks';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

export default async function DashboardPage() {
    const session = await auth();
    const userName = session?.user?.name?.split(' ')[0] || 'Learner';
    const userId = session?.user?.id;

    if (!userId) return null; // Should be handled by layout but just in case

    // Check and update streak (this ensures the DB is current before we fetch logic)
    // We execute this in parallel with other fetches if possible, but for simplicity/correctness we can just await it or promise.all
    // Ideally, we want the *updated* streak value.
    const streakResult = await checkAndUpdateStreak(userId);

    // Fetch tracks
    const tracks = await getTracks(userId);

    // Fetch user stats
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true, currentStreak: true }
    });
    const userPoints = user?.points || 0;
    // Use the result from checkAndUpdateStreak if available (it might be fresher), otherwise DB
    const currentStreak = streakResult?.streak ?? user?.currentStreak ?? 0;

    // Get last active lesson
    const lastLesson = await getLastActiveLesson(userId);

    // Calculate Rank (Count users with more points)
    const higherRankUsersCount = await prisma.user.count({
        where: {
            points: {
                gt: userPoints
            },
            role: 'MEMBER' // Only compare against other members
        }
    });

    // Rank is the count of people above you + 1
    const currentRank = higherRankUsersCount + 1;

    const stats = {
        totalPoints: userPoints,
        streak: currentStreak,
        rank: currentRank,
    };

    return (
        <div className="space-y-8 animate-fade-in pb-8">
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
                <Card className="p-6 flex items-center gap-5 hover:border-[var(--primary)]/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center border border-[var(--primary)]/10">
                        <Trophy className="w-7 h-7 text-[var(--primary)]" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold leading-none mb-1">{stats.totalPoints.toLocaleString()}</p>
                        <p className="text-sm text-[var(--text-muted)] font-medium">Total Poin</p>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-5 hover:border-[var(--warning)]/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--warning)]/20 to-[var(--warning)]/5 flex items-center justify-center border border-[var(--warning)]/10">
                        <Flame className="w-7 h-7 text-[var(--warning)]" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold leading-none mb-1">{stats.streak} hari</p>
                        <p className="text-sm text-[var(--text-muted)] font-medium">Streak Saat Ini</p>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-5 hover:border-[var(--success)]/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--success)]/20 to-[var(--success)]/5 flex items-center justify-center border border-[var(--success)]/10">
                        <Target className="w-7 h-7 text-[var(--success)]" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold leading-none mb-1">#{stats.rank || '-'}</p>
                        <p className="text-sm text-[var(--text-muted)] font-medium">Peringkat</p>
                    </div>
                </Card>
            </div>

            {/* Continue Learning */}
            {lastLesson && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Lanjutkan Belajar</h2>
                    <Card className="p-6 border-[var(--primary)]/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center shadow-lg">
                                    <Wrench className="w-8 h-8 text-[var(--primary)]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary-light)]">
                                            {(lastLesson as any).module.track.name}
                                        </span>
                                        <span className="text-xs text-[var(--text-muted)]">•</span>
                                        <span className="text-xs text-[var(--text-secondary)]">{(lastLesson as any).module.name}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-[var(--primary-light)] transition-colors">{lastLesson.title}</h3>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Pelajaran {(lastLesson as any).orderIndex + 1}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/lessons/${lastLesson.id}`}
                                className={clsx(buttonVariants.base, buttonVariants.variants.primary, buttonVariants.sizes.lg, "shadow-lg shadow-blue-500/20")}
                            >
                                Lanjutkan
                                <ChevronRight className="w-5 h-5 ml-1" />
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

                <div className="grid md:grid-cols-3 gap-6 items-start">
                    {tracks.map((track: any) => (
                        <TrackCardInteractive key={track.id} track={track} />
                    ))}
                </div>
            </div>
            {/* Onboarding Tour */}
            <OnboardingModal userId={userId} />
        </div>
    );
}
