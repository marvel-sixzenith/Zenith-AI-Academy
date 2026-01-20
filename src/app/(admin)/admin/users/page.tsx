import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import UserTable from '@/components/admin/UserTable';

export default async function UsersPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
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
        image: user.image,
        phone: user.phone,
        role: user.role,
        points: user.points,
        progress: totalLessons > 0 ? Math.round((user.progress.length / totalLessons) * 100) : 0,
        lastActive: formatTimeAgo(user.lastActiveAt),
        createdAt: formatDate(user.createdAt)
    }));

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-[var(--text-secondary)]">
                        View and manage all platform users ({users.length} total)
                    </p>
                </div>
            </div>

            {/* Client Component for Interactive Table */}
            <UserTable users={userData} />
        </div>
    );
}
