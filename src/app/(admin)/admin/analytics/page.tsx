import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import {
    Users,
    UserPlus,
    TrendingUp,
    BookOpen,
    CheckCircle,
    Activity,
    Calendar,
    Award,
    Clock,
    Eye
} from 'lucide-react';

export default async function AnalyticsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    // Get current date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Fetch comprehensive analytics
    const [
        // User metrics
        totalUsers,
        newUsers7d,
        newUsers30d,
        activeUsers7d,
        activeUsers30d,

        // Content metrics
        totalTracks,
        publishedLessons,
        draftLessons,

        // Progress metrics
        totalProgress,
        completedLessons,
        inProgressLessons,

        // Recent activity
        recentProgress,

        // User registration trend
        userRegistrations
    ] = await Promise.all([
        // User counts
        prisma.user.count(),
        prisma.user.count({
            where: { createdAt: { gte: last7Days } }
        }),
        prisma.user.count({
            where: { createdAt: { gte: last30Days } }
        }),
        prisma.user.count({
            where: { lastActiveAt: { gte: last7Days } }
        }),
        prisma.user.count({
            where: { lastActiveAt: { gte: last30Days } }
        }),

        // Content counts
        prisma.track.count(),
        prisma.lesson.count({
            where: { status: 'PUBLISHED' }
        }),
        prisma.lesson.count({
            where: { status: 'DRAFT' }
        }),

        // Progress counts
        prisma.userProgress.count(),
        prisma.userProgress.count({
            where: { status: 'COMPLETED' }
        }),
        prisma.userProgress.count({
            where: { status: 'IN_PROGRESS' }
        }),

        // Recent progress
        prisma.userProgress.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                status: true,
                createdAt: true,
                user: {
                    select: { name: true, email: true }
                },
                lesson: {
                    select: { title: true }
                }
            }
        }),

        // User registrations for trend
        prisma.user.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: last30Days }
            },
            _count: true
        })
    ]);

    // Calculate engagement metrics
    const engagementRate7d = totalUsers > 0 ? Math.round((activeUsers7d / totalUsers) * 100) : 0;
    const engagementRate30d = totalUsers > 0 ? Math.round((activeUsers30d / totalUsers) * 100) : 0;
    const completionRate = totalProgress > 0 ? Math.round((completedLessons / totalProgress) * 100) : 0;
    const avgProgressPerUser = totalUsers > 0 ? Math.round(totalProgress / totalUsers) : 0;

    // Get top performing lessons
    const topLessons = await prisma.lesson.findMany({
        take: 5,
        where: { status: 'PUBLISHED' },
        select: {
            id: true,
            title: true,
            _count: {
                select: {
                    progress: {
                        where: { status: 'COMPLETED' }
                    }
                }
            }
        },
        orderBy: {
            progress: {
                _count: 'desc'
            }
        }
    });

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-[var(--text-secondary)]">
                    Comprehensive insights into platform performance and user engagement
                </p>
            </div>

            {/* Key Metrics Grid */}
            <div>
                <h2 className="text-xl font-bold mb-4">Overview Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-2xl font-bold">{totalUsers}</p>
                                <p className="text-sm text-[var(--text-muted)]">Total Users</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <span className="text-[var(--success)]">+{newUsers7d} 7d</span>
                            <span className="text-[var(--text-muted)]">+{newUsers30d} 30d</span>
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-[var(--success)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-2xl font-bold">{activeUsers7d}</p>
                                <p className="text-sm text-[var(--text-muted)]">Active Users (7d)</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <span className="text-[var(--primary)]">{engagementRate7d}% engagement</span>
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-[var(--warning)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-2xl font-bold">{publishedLessons}</p>
                                <p className="text-sm text-[var(--text-muted)]">Published Lessons</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <span className="text-[var(--text-muted)]">{draftLessons} drafts</span>
                            <span className="text-[var(--text-muted)]">{totalTracks} tracks</span>
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)]/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-[var(--primary-light)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-2xl font-bold">{completionRate}%</p>
                                <p className="text-sm text-[var(--text-muted)]">Completion Rate</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <span className="text-[var(--success)]">{completedLessons} completed</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Engagement Metrics */}
            <div>
                <h2 className="text-xl font-bold mb-4">Engagement Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <UserPlus className="w-6 h-6 text-[var(--primary)]" />
                            <span className="text-sm px-2 py-1 rounded bg-[var(--success)]/10 text-[var(--success)]">
                                +{Math.round(((newUsers7d / (totalUsers || 1)) * 100))}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-1">{newUsers30d}</p>
                        <p className="text-sm text-[var(--text-muted)]">New Users (30d)</p>
                        <div className="mt-4 h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]"
                                style={{ width: `${Math.min((newUsers30d / totalUsers) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <Activity className="w-6 h-6 text-[var(--success)]" />
                            <span className="text-sm px-2 py-1 rounded bg-[var(--success)]/10 text-[var(--success)]">
                                {engagementRate30d}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-1">{activeUsers30d}</p>
                        <p className="text-sm text-[var(--text-muted)]">Active Users (30d)</p>
                        <div className="mt-4 h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[var(--success)] to-[var(--success-light)]"
                                style={{ width: `${engagementRate30d}%` }}
                            />
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <Award className="w-6 h-6 text-[var(--warning)]" />
                            <span className="text-sm px-2 py-1 rounded bg-[var(--warning)]/10 text-[var(--warning)]">
                                {avgProgressPerUser} avg
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-1">{totalProgress}</p>
                        <p className="text-sm text-[var(--text-muted)]">Total Enrollments</p>
                        <div className="mt-4 h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[var(--warning)] to-[var(--warning-light)]"
                                style={{ width: `${Math.min((totalProgress / (totalUsers * publishedLessons || 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Lessons */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Top Performing Lessons</h2>
                    <div className="glass-card divide-y divide-[var(--border-color)]">
                        {topLessons.length > 0 ? (
                            topLessons.map((lesson: any, index: number) => (
                                <div key={lesson.id} className="p-4 flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${index === 0 ? 'bg-[var(--warning)]/20 text-[var(--warning)]' :
                                        index === 1 ? 'bg-[var(--primary)]/20 text-[var(--primary)]' :
                                            'bg-[var(--background-secondary)] text-[var(--text-muted)]'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{lesson.title}</p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            {lesson._count.progress} completions
                                        </p>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-[var(--success)] shrink-0" />
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-[var(--text-muted)]">
                                No lesson data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <div className="glass-card divide-y divide-[var(--border-color)]">
                        {recentProgress.length > 0 ? (
                            recentProgress.map((progress: any) => (
                                <div key={progress.id} className="p-4 flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${progress.status === 'COMPLETED'
                                        ? 'bg-[var(--success)]/10'
                                        : 'bg-[var(--primary)]/10'
                                        }`}>
                                        {progress.status === 'COMPLETED' ? (
                                            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-[var(--primary)]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{progress.user.name}</p>
                                        <p className="text-xs text-[var(--text-muted)] truncate">
                                            {progress.status === 'COMPLETED' ? 'Completed' : 'Started'} "{progress.lesson.title}"
                                        </p>
                                    </div>
                                    <span className="text-xs text-[var(--text-muted)] shrink-0">
                                        {formatTimeAgo(progress.createdAt)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-[var(--text-muted)]">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Breakdown */}
            <div>
                <h2 className="text-xl font-bold mb-4">Learning Progress Breakdown</h2>
                <div className="glass-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[var(--text-secondary)]">Completed</span>
                                <span className="text-sm font-bold text-[var(--success)]">{completedLessons}</span>
                            </div>
                            <div className="h-3 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--success)] rounded-full transition-all"
                                    style={{ width: `${totalProgress > 0 ? (completedLessons / totalProgress) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[var(--text-secondary)]">In Progress</span>
                                <span className="text-sm font-bold text-[var(--primary)]">{inProgressLessons}</span>
                            </div>
                            <div className="h-3 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--primary)] rounded-full transition-all"
                                    style={{ width: `${totalProgress > 0 ? (inProgressLessons / totalProgress) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[var(--text-secondary)]">Not Started</span>
                                <span className="text-sm font-bold text-[var(--text-muted)]">
                                    {totalProgress - completedLessons - inProgressLessons}
                                </span>
                            </div>
                            <div className="h-3 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--text-muted)] rounded-full transition-all"
                                    style={{
                                        width: `${totalProgress > 0 ? ((totalProgress - completedLessons - inProgressLessons) / totalProgress) * 100 : 0}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--text-secondary)]">Overall Completion Rate</span>
                            <span className="text-2xl font-bold text-gradient">{completionRate}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
