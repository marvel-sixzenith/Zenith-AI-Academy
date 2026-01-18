
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Trophy, Medal, Crown, User as UserIcon, Star, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Leaderboard | Zenith AI Academy',
    description: 'See the top performing students.',
};

async function getLeaderboardData() {
    const users = await prisma.user.findMany({
        where: {
            role: 'MEMBER', // Filter out admins as requested
        },
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

    const topThree = users.slice(0, 3);
    const restOfUsers = users.slice(3);

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-12">
            {/* Header */}
            <div className="text-center space-y-4 pt-8">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 mb-2 border border-yellow-500/30">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600">
                    Hall of Fame
                </h1>
                <p className="text-[var(--text-secondary)] text-lg max-w-lg mx-auto">
                    Rayakan pencapaian para siswa terbaik Zenith AI Academy.
                </p>
            </div>

            {/* Podium Section */}
            {users.length > 0 && (
                <div className="relative flex flex-wrap justify-center items-end gap-4 md:gap-8 px-4 pt-12 min-h-[300px]">
                    {/* Decorative Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-80 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-blue-500/10 blur-3xl -z-10 rounded-full" />

                    {/* Rank 2 (Left) */}
                    {topThree[1] && (
                        <div className="order-1 md:order-none flex flex-col items-center w-28 md:w-40 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="relative mb-3">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-slate-300 shadow-xl overflow-hidden ring-4 ring-slate-300/20">
                                    {topThree[1].image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={topThree[1].image} alt={topThree[1].name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <UserIcon className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1 rounded-full border border-slate-600 shadow-lg">
                                    #2
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <p className="font-bold text-[var(--text-primary)] truncate max-w-full text-sm md:text-base">
                                    {topThree[1].name || 'Member'}
                                </p>
                                <p className="text-slate-400 font-mono font-bold text-xs md:text-sm">
                                    {topThree[1].points.toLocaleString()} XP
                                </p>
                            </div>
                            <div className="w-full h-24 md:h-32 mt-4 bg-gradient-to-t from-slate-500/20 to-transparent rounded-t-xl border-t border-slate-500/30 w-full" />
                        </div>
                    )}

                    {/* Rank 1 (Center) */}
                    {topThree[0] && (
                        <div className="order-2 md:order-none flex flex-col items-center w-32 md:w-48 z-10 -mt-8 md:-mt-12 animate-slide-up">
                            <div className="relative mb-4">
                                <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 animate-bounce" />
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] overflow-hidden ring-4 ring-yellow-400/20">
                                    {topThree[0].image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={topThree[0].image} alt={topThree[0].name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-yellow-900/20 flex items-center justify-center">
                                            <UserIcon className="w-10 h-10 text-yellow-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg border border-yellow-400">
                                    #1
                                </div>
                            </div>
                            <div className="text-center mt-2 scale-110">
                                <p className="font-bold text-[var(--text-primary)] truncate max-w-full text-base md:text-lg bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                                    {topThree[0].name || 'Champion'}
                                </p>
                                <p className="text-yellow-500 font-mono font-bold text-sm md:text-base flex items-center justify-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {topThree[0].points.toLocaleString()} XP
                                    <Sparkles className="w-3 h-3" />
                                </p>
                            </div>
                            <div className="w-full h-32 md:h-44 mt-4 bg-gradient-to-t from-yellow-500/20 to-transparent rounded-t-xl border-t border-yellow-500/30 w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                                <div className="absolute top-0 w-full h-px bg-yellow-400 shadow-[0_0_10px_2px_rgba(250,204,21,0.5)]" />
                            </div>
                        </div>
                    )}

                    {/* Rank 3 (Right) */}
                    {topThree[2] && (
                        <div className="order-3 md:order-none flex flex-col items-center w-28 md:w-40 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="relative mb-3">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-amber-700 shadow-xl overflow-hidden ring-4 ring-amber-700/20">
                                    {topThree[2].image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={topThree[2].image} alt={topThree[2].name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-amber-900/20 flex items-center justify-center">
                                            <UserIcon className="w-8 h-8 text-amber-700" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-800 text-amber-100 text-xs font-bold px-3 py-1 rounded-full border border-amber-700 shadow-lg">
                                    #3
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <p className="font-bold text-[var(--text-primary)] truncate max-w-full text-sm md:text-base">
                                    {topThree[2].name || 'Member'}
                                </p>
                                <p className="text-amber-700 font-mono font-bold text-xs md:text-sm">
                                    {topThree[2].points.toLocaleString()} XP
                                </p>
                            </div>
                            <div className="w-full h-20 md:h-24 mt-4 bg-gradient-to-t from-amber-700/20 to-transparent rounded-t-xl border-t border-amber-700/30 w-full" />
                        </div>
                    )}
                </div>
            )}

            {/* List Section */}
            {restOfUsers.length > 0 && (
                <div className="glass-card overflow-hidden max-w-3xl mx-auto border border-[var(--border-color)]">
                    <div className="divide-y divide-[var(--border-color)]">
                        {restOfUsers.map((user, index) => {
                            const rank = index + 4;
                            const isCurrentUser = user.id === currentUserId;

                            return (
                                <div
                                    key={user.id}
                                    className={`flex items-center gap-4 p-4 transition-colors ${isCurrentUser
                                            ? 'bg-[var(--primary)]/10 hover:bg-[var(--primary)]/15 border-l-4 border-[var(--primary)]'
                                            : 'hover:bg-[var(--background-secondary)]/50 border-l-4 border-transparent'
                                        }`}
                                >
                                    <div className="w-8 flex justify-center font-bold text-[var(--text-muted)]">
                                        {rank}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] overflow-hidden flex-shrink-0">
                                        {user.image ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium truncate ${isCurrentUser ? 'text-[var(--primary)]' : ''}`}>
                                            {user.name || 'Anonymous'}
                                            {isCurrentUser && <span className="ml-2 text-xs opacity-75">(Anda)</span>}
                                        </div>
                                    </div>
                                    <div className="font-mono font-bold text-[var(--primary)]">
                                        {user.points.toLocaleString()} XP
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {users.length === 0 && (
                <div className="p-12 text-center text-[var(--text-muted)] animate-pulse">
                    Data peringkat sedang dihitung...
                </div>
            )}
        </div>
    );
}
