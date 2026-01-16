import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function LeaderboardPage() {
    const session = await auth();

    // Fetch top users by points
    const topUsers = await prisma.user.findMany({
        orderBy: { points: 'desc' },
        take: 50,
        select: {
            id: true,
            name: true,
            email: true,
            points: true,
            role: true,
            progress: {
                where: { status: 'COMPLETED' },
                select: { id: true },
            },
        },
    });

    const calculateRank = (index: number) => {
        return index + 1;
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
        return null;
    };

    const currentUserRank = topUsers.findIndex(u => u.id === session?.user?.id) + 1;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="text-center">
                <Trophy className="w-16 h-16 text-[var(--primary)] mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
                <p className="text-[var(--text-secondary)]">
                    Top performers in the Zenith AI Academy
                </p>
            </div>

            {/* Current User Stats */}
            {currentUserRank > 0 && (
                <div className="glass-card p-6 text-center">
                    <p className="text-sm text-[var(--text-muted)] mb-2">Your Rank</p>
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-4xl font-bold text-[var(--primary)]">#{currentUserRank}</div>
                        <div className="text-left">
                            <p className="text-2xl font-bold">{topUsers[currentUserRank - 1]?.points.toLocaleString()}</p>
                            <p className="text-sm text-[var(--text-muted)]">points</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4">
                {topUsers.slice(0, 3).map((user, index) => (
                    <div
                        key={user.id}
                        className={`glass-card p-6 text-center ${index === 0 ? 'order-2 scale-105' : index === 1 ? 'order-1' : 'order-3'
                            }`}
                    >
                        {getRankIcon(index + 1)}
                        <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-2xl mx-auto my-4">
                            {user.name.charAt(0)}
                        </div>
                        <h3 className="font-bold truncate">{user.name}</h3>
                        <div className="text-2xl font-bold text-[var(--primary)] mt-2">
                            {user.points.toLocaleString()}
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                            {user.progress.length} lessons completed
                        </p>
                    </div>
                ))}
            </div>

            {/* Full Leaderboard */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold">All Rankings</h2>
                </div>

                <div className="divide-y divide-[var(--border-color)]">
                    {topUsers.map((user, index) => (
                        <div
                            key={user.id}
                            className={`p-4 flex items-center gap-4 hover:bg-[var(--background-card)] transition ${user.id === session?.user?.id ? 'bg-[var(--primary)]/5' : ''
                                }`}
                        >
                            {/* Rank */}
                            <div className="w-12 text-center">
                                {getRankIcon(calculateRank(index)) || (
                                    <span className="text-xl font-bold text-[var(--text-muted)]">
                                        {calculateRank(index)}
                                    </span>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold shrink-0">
                                {user.name.charAt(0)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold truncate">{user.name}</h4>
                                    {user.role === 'ADMIN' && (
                                        <span className="badge badge-success text-xs">Admin</span>
                                    )}
                                    {user.role === 'SUPER_ADMIN' && (
                                        <span className="badge badge-warning text-xs">Super Admin</span>
                                    )}
                                    {user.id === session?.user?.id && (
                                        <span className="badge badge-primary text-xs">You</span>
                                    )}
                                </div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {user.progress.length} lessons completed
                                </p>
                            </div>

                            {/* Points */}
                            <div className="text-right">
                                <div className="text-xl font-bold text-[var(--primary)]">
                                    {user.points.toLocaleString()}
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">points</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
