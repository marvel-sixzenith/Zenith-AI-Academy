import Link from 'next/link';
import { Users, BookOpen, TrendingUp, Activity, ChevronRight, UserPlus, AlertTriangle } from 'lucide-react';
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
        completionStats
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
        })
    ]);

    const completedCount = completionStats.find((s: { status: string; _count: number }) => s.status === 'COMPLETED')?._count || 0;
    const inProgressCount = completionStats.find((s: { status: string; _count: number }) => s.status === 'IN_PROGRESS')?._count || 0;

    // Get recent sign-ups
    const recentSignups = await prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true
        }
    });

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
        avgCompletion: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    };

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-[var(--text-secondary)]">
                    Overview of platform activity and key metrics
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Users className="w-8 h-8 text-[var(--primary)]" />
                        <span className="text-sm text-[var(--success)]">+{stats.newUsers7d} this week</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
                    <p className="text-sm text-[var(--text-muted)]">Total Users</p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Activity className="w-8 h-8 text-[var(--success)]" />
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.activeUsers7d}</p>
                    <p className="text-sm text-[var(--text-muted)]">Active Users (7d)</p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <BookOpen className="w-8 h-8 text-[var(--warning)]" />
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.totalTracks}</p>
                    <p className="text-sm text-[var(--text-muted)]">Learning Tracks</p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="w-8 h-8 text-[var(--primary-light)]" />
                    </div>
                    <p className="text-3xl font-bold mb-1">{stats.completedLessons}</p>
                    <p className="text-sm text-[var(--text-muted)]">Lessons Completed</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/users" className="glass-card p-5 hover:scale-105 transition">
                        <Users className="w-6 h-6 text-[var(--primary)] mb-3" />
                        <h3 className="font-bold mb-1">Manage Users</h3>
                        <p className="text-sm text-[var(--text-secondary)]">View and manage all platform users</p>
                    </Link>

                    <div className="glass-card p-5 hover:scale-105 transition cursor-pointer opacity-60">
                        <BookOpen className="w-6 h-6 text-[var(--success)] mb-3" />
                        <h3 className="font-bold mb-1">Content Management</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Create and edit courses (Coming soon)</p>
                    </div>

                    <Link href="/admin/analytics" className="glass-card p-5 hover:scale-105 transition">
                        <TrendingUp className="w-6 h-6 text-[var(--warning)] mb-3" />
                        <h3 className="font-bold mb-1">Analytics</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Deep dive into metrics and insights</p>
                    </Link>
                </div>
            </div>

            {/* Recent Sign-ups */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Recent Sign-ups</h2>
                    <Link
                        href="/admin/users"
                        className="text-sm text-[var(--primary-light)] hover:text-[var(--primary)] flex items-center gap-1"
                    >
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="glass-card divide-y divide-[var(--border-color)]">
                    {recentSignups.length > 0 ? (
                        recentSignups.map((user: { id: string; name: string; email: string; image?: string | null; createdAt: Date }) => (
                            <div key={user.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {user.image ? (
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[var(--border-color)]">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={user.image}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-medium">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                                    </div>
                                </div>
                                <span className="text-sm text-[var(--text-muted)]">{formatTimeAgo(user.createdAt)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-[var(--text-muted)]">
                            No recent sign-ups
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
