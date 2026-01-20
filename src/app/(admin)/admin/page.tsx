import Link from 'next/link';
import { Users, BookOpen, TrendingUp, Activity, ChevronRight, Trophy, Flame, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    // Fetch real statistics from database
    const [
        totalUsers,
        recentUsers,
        totalTracks,
        totalLessons,
        completionStats,
        gamificationStats,
        recentSignups,
        recentProgress
    ] = await Promise.all([
        // Total users
        prisma.user.count(),

        // Recent users (last 7 days)
        prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        }),

        // Total tracks
        prisma.track.count(),

        // Total published lessons
        prisma.lesson.count({
            where: { status: 'PUBLISHED' }
        }),

        // Completion stats
        prisma.userProgress.groupBy({
            by: ['status'],
            _count: true
        }),

        // Gamification Stats (Points & Streaks)
        prisma.user.aggregate({
            _sum: { points: true },
            _avg: { currentStreak: true }
        }),

        // Recent Signups (take 5)
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, image: true, createdAt: true }
        }),

        // Recent Progress (take 5)
        prisma.userProgress.findMany({
            take: 5,
            where: { status: 'COMPLETED' },
            orderBy: { updatedAt: 'desc' },
            include: {
                user: { select: { name: true, image: true } },
                lesson: { select: { title: true } }
            }
        })
    ]);

    const completedCount = completionStats.find((s: { status: string; _count: number }) => s.status === 'COMPLETED')?._count || 0;

    // Calculate active users (users with activity in last 7 days)
    const activeUsers = await prisma.user.count({
        where: {
            lastActiveAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        }
    });

    const stats = {
        totalUsers,
        activeUsers7d: activeUsers,
        newUsers7d: recentUsers,
        totalTracks,
        totalLessons,
        completedLessons: completedCount,
        totalPoints: gamificationStats._sum.points || 0,
        avgStreak: Math.round(gamificationStats._avg.currentStreak || 0)
    };

    // Combine recent activity (Signups + Completions) for a "Feed"
    // We tag them with type 'signup' or 'completion'
    const combinedActivity = [
        ...recentSignups.map(u => ({ type: 'signup', date: u.createdAt, data: u })),
        ...recentProgress.map(p => ({ type: 'completion', date: p.updatedAt || new Date(), data: p }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-[var(--text-secondary)]">
                        Platform overview & real-time metrics
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/content" className="btn-primary">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Manage Content
                    </Link>
                </div>
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-[var(--success)]/10 text-[var(--success)] rounded-full">
                            +{stats.newUsers7d} new
                        </span>
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
                    <p className="text-sm text-[var(--text-muted)]">Total Learners</p>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-[var(--success)]/10 text-[var(--success)] rounded-lg">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.activeUsers7d}</p>
                    <p className="text-sm text-[var(--text-muted)]">Active (7 Days)</p>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-[var(--warning)]/10 text-[var(--warning)] rounded-lg">
                            <Trophy className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold mb-1">{(stats.totalPoints / 1000).toFixed(1)}k</p>
                    <p className="text-sm text-[var(--text-muted)]">Total Points Minted</p>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                            <Flame className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.avgStreak} days</p>
                    <p className="text-sm text-[var(--text-muted)]">Avg User Streak</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Col: Activity Feed (Takes 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Platform Activity</h2>
                        <Link href="/admin/users" className="text-sm text-[var(--primary)] hover:underline">View All Users</Link>
                    </div>

                    <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-[var(--border-color)]">
                            {combinedActivity.length > 0 ? (
                                combinedActivity.map((item: any, i) => (
                                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-[var(--background-secondary)]/50 transition">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${item.type === 'signup'
                                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                : 'bg-green-500/10 border-green-500/20 text-green-500'
                                            }`}>
                                            {item.type === 'signup' ? <UserPlus className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm">
                                                    {item.type === 'signup' ? item.data.name : item.data.user?.name}
                                                </p>
                                                <span className="text-[var(--text-muted)] text-xs">•</span>
                                                <span className="text-xs text-[var(--text-muted)]">{formatTimeAgo(item.date)}</span>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] truncate">
                                                {item.type === 'signup'
                                                    ? 'Joined the platform'
                                                    : `Completed lesson "${item.data.lesson?.title}"`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-[var(--text-muted)]">No recent activity</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Col: Quick Actions & Content Stats */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Quick Management</h2>

                    <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
                        <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background-secondary)] transition group">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Manage Users</h3>
                                <p className="text-xs text-[var(--text-muted)]">View, ban, or edit profiles</p>
                            </div>
                            <ChevronRight className="w-4 h-4 ml-auto text-[var(--text-muted)]" />
                        </Link>

                        <Link href="/admin/analytics" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background-secondary)] transition group">
                            <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center group-hover:bg-[var(--warning)] group-hover:text-white transition">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Analytics</h3>
                                <p className="text-xs text-[var(--text-muted)]">Deep dive into data</p>
                            </div>
                            <ChevronRight className="w-4 h-4 ml-auto text-[var(--text-muted)]" />
                        </Link>
                    </div>

                    {/* Content Health */}
                    <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
                        <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-[var(--text-muted)]">Content Health</h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Lessons Published</span>
                                    <span className="font-bold">{stats.completedLessons}/{stats.totalLessons} utilized</span>
                                </div>
                                <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--primary)] w-3/4 rounded-full"></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{stats.totalTracks}</p>
                                    <p className="text-xs text-[var(--text-muted)]">Tracks</p>
                                </div>
                                <div className="h-8 w-[1px] bg-[var(--border-color)]"></div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{stats.totalLessons}</p>
                                    <p className="text-xs text-[var(--text-muted)]">Lessons</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
