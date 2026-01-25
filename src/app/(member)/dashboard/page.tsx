import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Wrench, ChevronRight, Trophy, Flame, Target } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getTracks } from '@/lib/tracks';
import { getLastActiveLesson } from '@/lib/user-progress';
import { Card } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import clsx from 'clsx';
import InteractiveTrackList from '@/components/learning/InteractiveTrackList';
import { checkAndUpdateStreak } from '@/lib/user-streaks';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { AnimatedDashboard, AnimatedItem, AnimatedCard, AnimatedGrid } from '@/components/dashboard/AnimatedDashboard';

export default async function DashboardPage() {
    const session = await auth();
    const userName = session?.user?.name?.split(' ')[0] || 'Learner';
    const userId = session?.user?.id;

    if (!userId) return null;

    const streakResult = await checkAndUpdateStreak(userId);
    const tracks = await getTracks(userId);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true, currentStreak: true, hasCompletedOnboarding: true }
    });
    const userPoints = user?.points || 0;
    const currentStreak = streakResult?.streak ?? user?.currentStreak ?? 0;

    const lastLesson = await getLastActiveLesson(userId);

    const higherRankUsersCount = await prisma.user.count({
        where: {
            points: { gt: userPoints },
            role: 'MEMBER'
        }
    });
    const currentRank = higherRankUsersCount + 1;

    const stats = {
        totalPoints: userPoints,
        streak: currentStreak,
        rank: currentRank,
    };

    return (
        <AnimatedDashboard className="space-y-5 md:space-y-8 pb-6 md:pb-8">
            {/* Welcome Header */}
            <AnimatedItem>
                <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
                    Selamat datang, <span className="text-gradient">{userName}</span>!
                </h1>
                <p className="text-sm md:text-base text-[var(--text-secondary)]">
                    Lanjutkan perjalanan belajar Anda.
                </p>
            </AnimatedItem>

            {/* Stats Cards - Compact on Mobile */}
            <AnimatedGrid className="grid grid-cols-3 gap-2 md:gap-4">
                <AnimatedCard>
                    <Card className="p-3 md:p-5 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 text-center md:text-left hover:border-[var(--primary)]/30 transition-colors">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center border border-[var(--primary)]/10">
                            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-[var(--primary)]" />
                        </div>
                        <div>
                            <p className="text-lg md:text-2xl font-bold leading-none mb-0.5">{stats.totalPoints.toLocaleString()}</p>
                            <p className="text-[10px] md:text-xs text-[var(--text-muted)] font-medium">Poin</p>
                        </div>
                    </Card>
                </AnimatedCard>

                <AnimatedCard>
                    <Card className="p-3 md:p-5 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 text-center md:text-left hover:border-[var(--warning)]/30 transition-colors">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[var(--warning)]/20 to-[var(--warning)]/5 flex items-center justify-center border border-[var(--warning)]/10">
                            <Flame className="w-5 h-5 md:w-6 md:h-6 text-[var(--warning)]" />
                        </div>
                        <div>
                            <p className="text-lg md:text-2xl font-bold leading-none mb-0.5">{stats.streak}</p>
                            <p className="text-[10px] md:text-xs text-[var(--text-muted)] font-medium">Streak</p>
                        </div>
                    </Card>
                </AnimatedCard>

                <AnimatedCard>
                    <Card className="p-3 md:p-5 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 text-center md:text-left hover:border-[var(--success)]/30 transition-colors">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[var(--success)]/20 to-[var(--success)]/5 flex items-center justify-center border border-[var(--success)]/10">
                            <Target className="w-5 h-5 md:w-6 md:h-6 text-[var(--success)]" />
                        </div>
                        <div>
                            <p className="text-lg md:text-2xl font-bold leading-none mb-0.5">#{stats.rank || '-'}</p>
                            <p className="text-[10px] md:text-xs text-[var(--text-muted)] font-medium">Rank</p>
                        </div>
                    </Card>
                </AnimatedCard>
            </AnimatedGrid>

            {/* Continue Learning - Compact on Mobile */}
            {lastLesson && (
                <AnimatedItem>
                    <h2 className="text-base md:text-xl font-bold mb-3 md:mb-4">Lanjutkan Belajar</h2>
                    <Card className="p-4 md:p-6 border-[var(--primary)]/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-24 md:p-32 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
                            <div className="flex items-center gap-3 md:gap-5">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center shadow-lg shrink-0">
                                    <Wrench className="w-6 h-6 md:w-7 md:h-7 text-[var(--primary)]" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                                        <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary-light)]">
                                            {(lastLesson as any).module.track.name}
                                        </span>
                                        <span className="hidden sm:inline text-xs text-[var(--text-muted)]">•</span>
                                        <span className="hidden sm:inline text-xs text-[var(--text-secondary)]">{(lastLesson as any).module.name}</span>
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold mb-0.5 group-hover:text-[var(--primary-light)] transition-colors line-clamp-1">{lastLesson.title}</h3>
                                    <p className="text-xs md:text-sm text-[var(--text-muted)]">
                                        Pelajaran {(lastLesson as any).orderIndex + 1}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={`/lessons/${lastLesson.id}`}
                                className={clsx(buttonVariants.base, buttonVariants.variants.primary, "text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3 shadow-lg shadow-blue-500/20 shrink-0")}
                            >
                                Lanjutkan
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1" />
                            </Link>
                        </div>
                    </Card>
                </AnimatedItem>
            )}

            {/* Learning Tracks */}
            <AnimatedItem>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-base md:text-xl font-bold">Track Pembelajaran</h2>
                    <Link
                        href="/tracks"
                        className="text-xs md:text-sm text-[var(--primary-light)] hover:text-[var(--primary)] flex items-center gap-1 transition"
                    >
                        Lihat Semua
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                    </Link>
                </div>

                <InteractiveTrackList tracks={tracks} />
            </AnimatedItem>

            {/* Onboarding Tour */}
            <OnboardingTour user={user} />
        </AnimatedDashboard>
    );
}
