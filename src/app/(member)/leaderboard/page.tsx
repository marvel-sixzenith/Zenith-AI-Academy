
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Trophy, Medal, Crown, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Leaderboard | Zenith AI Academy',
    description: 'See the top performing students.',
};

async function getLeaderboardData() {
    const users = await prisma.user.findMany({
        orderBy: {
            points: 'desc',
        },
        take: 50,
        select: {
            id: true,
            name: true,
            image: true,
            points: true,
        },
    });
    return users;
}

export default async function LeaderboardPage() {
    const session = await auth();
    const currentUserId = session?.user?.id;
    const users = await getLeaderboardData();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Papan Peringkat</h1>
                    <p className="text-[var(--text-secondary)]">Siswa paling berprestasi sepanjang masa.</p>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border-color)] bg-[var(--background-secondary)]/50 text-sm font-semibold text-[var(--text-muted)]">
                    <div className="col-span-2 md:col-span-1 text-center">#</div>
                    <div className="col-span-7 md:col-span-8">Siswa</div>
                    <div className="col-span-3 text-right">XP</div>
                </div>

                {/* List */}
                <div className="divide-y divide-[var(--border-color)]">
                    {users.map((user, index) => {
                        const rank = index + 1;
                        const isCurrentUser = user.id === currentUserId;

                        let RankIcon = null;
                        if (rank === 1) RankIcon = <Crown className="w-5 h-5 text-yellow-500" />;
                        else if (rank === 2) RankIcon = <Medal className="w-5 h-5 text-gray-400" />;
                        else if (rank === 3) RankIcon = <Medal className="w-5 h-5 text-amber-700" />;

                        return (
                            <div
                                key={user.id}
                                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${isCurrentUser
                                    ? 'bg-[var(--primary)]/10 hover:bg-[var(--primary)]/15'
                                    : 'hover:bg-[var(--background-secondary)]/50'
                                    }`}
                            >
                                <div className="col-span-2 md:col-span-1 flex justify-center font-bold text-[var(--text-secondary)]">
                                    {RankIcon || rank}
                                </div>
                                <div className="col-span-7 md:col-span-8 flex items-center gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] overflow-hidden flex-shrink-0">
                                        {user.image ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                                <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`font-medium truncate ${isCurrentUser ? 'text-[var(--primary)]' : ''}`}>
                                            {user.name || 'Anonymous'}
                                            {isCurrentUser && <span className="ml-2 text-xs opacity-75">(Anda)</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-3 text-right font-mono font-bold text-[var(--primary)]">
                                    {user.points.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {users.length === 0 && (
                    <div className="p-12 text-center text-[var(--text-muted)]">
                        Belum ada data peringkat.
                    </div>
                )}
            </div>

            {/* Current User Stats (if not in top 50, show sticky footer? Or simple stats card) */}
            {/* For now, keep it simple. */}
        </div>
    );
}
