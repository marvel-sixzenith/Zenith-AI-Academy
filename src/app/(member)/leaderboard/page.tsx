
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

    // Ensure we have 3 spots for the podium logic, even if empty
    const topThree = [
        users[0] || null,
        users[1] || null,
        users[2] || null
    ];
    const restOfUsers = users.slice(3);

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-12 relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-lg h-[300px] bg-yellow-400/5 blur-[80px] rounded-full mix-blend-screen" />
            </div>

            {/* Header */}
            <div className="text-center space-y-4 pt-8 relative z-10">
                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 mb-2 border border-yellow-500/20 shadow-lg shadow-yellow-500/5 backdrop-blur-sm ring-1 ring-white/5">
                    <Trophy className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-sm font-sans tracking-tight">
                    Hall of Fame
                </h1>
                <p className="text-slate-400 text-lg max-w-lg mx-auto font-medium">
                    Celebrating the legends of <span className="text-blue-400">Zenith AI Academy</span>.
                </p>
            </div>

            {/* Podium Section */}
            {users.length > 0 && (
                <div className="relative z-10">
                    <div className="flex flex-wrap justify-center items-end px-4 gap-4 md:gap-8 min-h-[400px]">

                        {/* Rank 2 (Left) */}
                        <div className="order-1 md:order-none flex flex-col items-center w-28 md:w-44 animate-slide-up relative group" style={{ animationDelay: '0.1s' }}>
                            {topThree[1] ? (
                                <>
                                    <div className="relative mb-4 transition-transform duration-300 group-hover:-translate-y-2">
                                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-[3px] border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.2)] overflow-hidden ring-4 ring-slate-300/10 bg-slate-900">
                                            {topThree[1].image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={topThree[1].image} alt={topThree[1].name || 'User'} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                    <UserIcon className="w-8 h-8 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-slate-200 to-slate-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-lg min-w-[32px] text-center">
                                            #2
                                        </div>
                                    </div>
                                    <div className="text-center mb-3">
                                        <div className="font-bold text-slate-200 truncate max-w-[120px] md:max-w-[160px] text-sm md:text-base">
                                            {topThree[1].name}
                                        </div>
                                        <div className="text-slate-400 font-mono font-bold text-xs md:text-sm">
                                            {topThree[1].points.toLocaleString()} XP
                                        </div>
                                    </div>
                                    {/* Pedestal 2 */}
                                    <div className="w-full h-32 md:h-48 bg-gradient-to-b from-slate-700/30 to-slate-800/10 backdrop-blur-md rounded-t-2xl border-t border-x border-slate-600/30 relative overflow-hidden group-hover:bg-slate-700/40 transition-colors duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-b from-slate-400/5 to-transparent pointer-events-none" />
                                        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent" />
                                        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-900/50 to-transparent" />
                                    </div>
                                </>
                            ) : (
                                // Placeholder for Rank 2
                                <div className="w-full h-32 md:h-48 mt-[138px] opacity-20 bg-slate-800/20 rounded-t-2xl border-t border-slate-700/30"></div>
                            )}
                        </div>

                        {/* Rank 1 (Center) */}
                        <div className="order-2 md:order-none flex flex-col items-center w-36 md:w-56 z-20 -mt-12 animate-slide-up relative group">
                            {topThree[0] && (
                                <>
                                    <div className="relative mb-6 transition-transform duration-300 group-hover:-translate-y-3">
                                        <Crown className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce" style={{ animationDuration: '3s' }} />
                                        <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-[4px] border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] overflow-hidden ring-4 ring-yellow-400/10 bg-yellow-950/30 relative">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-transparent pointer-events-none z-10 mix-blend-overlay" />
                                            {topThree[0].image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={topThree[0].image} alt={topThree[0].name || 'User'} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-yellow-900/40">
                                                    <UserIcon className="w-12 h-12 text-yellow-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 text-white text-lg font-black px-5 py-1.5 rounded-full shadow-[0_4px_10px_rgba(234,179,8,0.4)] border border-yellow-200">
                                            1
                                        </div>
                                        {/* Glow behind head */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-500/20 blur-2xl -z-10 rounded-full" />
                                    </div>

                                    <div className="text-center mb-4">
                                        <div className="font-bold text-white text-lg md:text-xl truncate max-w-[180px] drop-shadow-lg">
                                            {topThree[0].name}
                                        </div>
                                        <div className="text-yellow-400 font-mono font-bold text-sm md:text-base flex items-center justify-center gap-2 mt-1 py-1 px-3 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                            <Sparkles className="w-3 h-3 text-yellow-300" />
                                            {topThree[0].points.toLocaleString()} XP
                                            <Sparkles className="w-3 h-3 text-yellow-300" />
                                        </div>
                                    </div>

                                    {/* Pedestal 1 */}
                                    <div className="w-full h-40 md:h-64 bg-gradient-to-b from-yellow-900/30 to-yellow-950/10 backdrop-blur-md rounded-t-2xl border-t border-x border-yellow-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.05)] group-hover:bg-yellow-900/40 transition-colors duration-300">
                                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
                                        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-yellow-500/5 to-transparent" />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Rank 3 (Right) */}
                        <div className="order-3 md:order-none flex flex-col items-center w-28 md:w-44 animate-slide-up relative group" style={{ animationDelay: '0.2s' }}>
                            {topThree[2] ? (
                                <>
                                    <div className="relative mb-4 transition-transform duration-300 group-hover:-translate-y-2">
                                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-[3px] border-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.2)] overflow-hidden ring-4 ring-amber-700/10 bg-amber-950/30">
                                            {topThree[2].image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={topThree[2].image} alt={topThree[2].name || 'User'} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-amber-900/40">
                                                    <UserIcon className="w-8 h-8 text-amber-700" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-600 to-amber-800 text-amber-100 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/50 shadow-lg min-w-[32px] text-center">
                                            #3
                                        </div>
                                    </div>
                                    <div className="text-center mb-3">
                                        <div className="font-bold text-slate-200 truncate max-w-[120px] md:max-w-[160px] text-sm md:text-base">
                                            {topThree[2].name}
                                        </div>
                                        <div className="text-amber-700 font-mono font-bold text-xs md:text-sm">
                                            {topThree[2].points.toLocaleString()} XP
                                        </div>
                                    </div>
                                    {/* Pedestal 3 */}
                                    <div className="w-full h-28 md:h-40 bg-gradient-to-b from-amber-900/20 to-amber-950/10 backdrop-blur-md rounded-t-2xl border-t border-x border-amber-800/30 relative overflow-hidden group-hover:bg-amber-900/30 transition-colors duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/5 to-transparent pointer-events-none" />
                                        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
                                        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-900/50 to-transparent" />
                                    </div>
                                </>
                            ) : (
                                // Placeholder for Rank 3
                                <div className="w-full h-28 md:h-40 mt-[138px] opacity-20 bg-slate-800/20 rounded-t-2xl border-t border-slate-700/30"></div>
                            )}
                        </div>
                    </div>
                    {/* Floor */}
                    <div className="relative h-4 mt-[-4px] mx-auto max-w-4xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent blur-sm" />
                        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
                    </div>
                </div>
            )}

            {/* List Section (Rank 4+) */}
            {restOfUsers.length > 0 && (
                <div className="relative z-10 glass-card overflow-hidden max-w-3xl mx-auto border border-[var(--border-color)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--background-secondary)]/50 to-transparent pointer-events-none" />
                    <div className="divide-y divide-[var(--border-color)] relative">
                        {restOfUsers.map((user, index) => {
                            const rank = index + 4;
                            const isCurrentUser = user.id === currentUserId;

                            return (
                                <div
                                    key={user.id}
                                    className={`flex items-center gap-4 p-4 transition-all duration-300 ${isCurrentUser
                                            ? 'bg-[var(--primary)]/10 hover:bg-[var(--primary)]/15 border-l-4 border-[var(--primary)]'
                                            : 'hover:bg-[var(--background-secondary)]/80 border-l-4 border-transparent hover:pl-5'
                                        }`}
                                >
                                    <div className="w-8 flex justify-center font-bold text-slate-500 font-mono text-lg">
                                        {rank}
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)] overflow-hidden flex-shrink-0 shadow-sm">
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
                                        <div className={`font-bold truncate text-base ${isCurrentUser ? 'text-[var(--primary)]' : 'text-slate-200'}`}>
                                            {user.name || 'Anonymous'}
                                            {isCurrentUser && <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-[10px] uppercase tracking-wider font-bold">You</span>}
                                        </div>
                                    </div>
                                    <div className="font-mono font-bold text-[var(--primary-light)] text-lg">
                                        {user.points.toLocaleString()} <span className="text-xs text-slate-500 ml-1">XP</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {users.length === 0 && (
                <div className="p-12 text-center text-[var(--text-muted)] animate-pulse relative z-10 glass-card max-w-xl mx-auto">
                    <p className="text-lg">Data peringkat sedang dihitung...</p>
                </div>
            )}
        </div>
    );
}
