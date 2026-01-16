import { Search, Filter, MoreVertical, UserPlus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

const roleColors: Record<string, string> = {
    MEMBER: 'var(--primary)',
    ADMIN: 'var(--success)',
    SUPER_ADMIN: 'var(--warning)',
};

export default async function UsersPage() {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        redirect('/dashboard');
    }

    // Fetch all users with their progress
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            progress: {
                where: { status: 'COMPLETED' },
                select: { id: true }
            },
            pointHistory: {
                select: { points: true }
            }
        }
    });

    // Get total lessons for progress calculation
    const totalLessons = await prisma.lesson.count({
        where: { status: 'PUBLISHED' }
    });

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date));
    };

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return formatDate(date);
    };

    const userData = users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        points: user.points,
        progress: totalLessons > 0 ? Math.round((user.progress.length / totalLessons) * 100) : 0,
        lastActive: formatTimeAgo(user.lastActiveAt),
        createdAt: formatDate(user.createdAt)
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-[var(--text-secondary)]">
                        View and manage all platform users ({users.length} total)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary opacity-50 cursor-not-allowed" disabled>
                        <Download className="w-5 h-5" />
                        Export CSV
                    </button>
                    <button className="btn-primary opacity-50 cursor-not-allowed" disabled>
                        <UserPlus className="w-5 h-5" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border-color)]">
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">User</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Role</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Points</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Progress</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Last Active</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userData.map((user: any) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-[var(--border-color)] hover:bg-[var(--background-card)] transition"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-medium shrink-0">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className="badge"
                                            style={{
                                                backgroundColor: `color-mix(in srgb, ${roleColors[user.role]} 15%, transparent)`,
                                                color: roleColors[user.role]
                                            }}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium">{user.points.toLocaleString()}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 progress-bar">
                                                <div className="progress-bar-fill" style={{ width: `${user.progress}%` }} />
                                            </div>
                                            <span className="text-sm text-[var(--text-muted)]">{user.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[var(--text-muted)]">{user.lastActive}</td>
                                    <td className="p-4 text-[var(--text-muted)]">{user.createdAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)]">
                    <p className="text-sm text-[var(--text-muted)]">
                        Showing {userData.length} of {userData.length} users
                    </p>
                </div>
            </div>
        </div>
    );
}
