import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ChevronLeft, Mail, Phone, Calendar, Clock, Trophy, Flame, PlayCircle, MoreHorizontal, Shield, Ban } from 'lucide-react';
import Link from 'next/link';
import UserActionButtons from '@/components/admin/UserActionButtons';
import UserLearningHistory from '@/components/admin/UserLearningHistory';

interface UserDetailPageProps {
    params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            progress: {
                orderBy: { updatedAt: 'desc' },
                include: {
                    lesson: {
                        select: {
                            id: true,
                            title: true,
                            pointsValue: true,
                            contentType: true,
                            contentData: true
                        }
                    }
                }
            },
            pointHistory: {
                orderBy: { createdAt: 'desc' },
                take: 10
            },
            // Fetch separate submissions as they might not be directly linked to UserProgress in a simple way
            // or we want details
            quizSubmissions: {
                orderBy: { completedAt: 'desc' },
                include: { answers: true }
            },
            assignmentSubmissions: true
        } as any // Cast to any to avoid TS error with stale Prisma types
    });

    if (!user) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold">User Not Found</h1>
                <Link href="/admin/users" className="text-[var(--primary)] mt-4 block hover:underline">
                    Back to Users
                </Link>
            </div>
        );
    }

    // Cast user to any to bypass stale Prisma types for new fields
    const typedUser = user as any;

    const totalLessons = await prisma.lesson.count({ where: { status: 'PUBLISHED' } });
    const completedLessons = typedUser.progress.filter((p: any) => p.status === 'COMPLETED').length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date));
    };

    // Merge progress with submission details
    const historyWithDetails = typedUser.progress.map((p: any) => {
        // Find matching submission
        const quizSub = typedUser.quizSubmissions?.find((q: any) => q.lessonId === p.lessonId);
        // Sort assignments by date desc and take first? Or just match by lessonId
        const assignmentSub = typedUser.assignmentSubmissions
            ?.filter((a: any) => a.lessonId === p.lessonId)
            .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

        // Ensure we pass the contentData down with the quizSubmission or separately
        // We will modify the structure slightly to ensure contentData is accessible in the History Item
        return {
            ...p,
            lesson: {
                ...p.lesson,
                contentData: p.lesson.contentData // Ensure it's passed explicitly if needed, though ...p.lesson handles it
            },
            quizSubmission: quizSub,
            assignmentSubmission: assignmentSub
        };
    });

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Link href="/admin/users" className="p-2 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--background-secondary)]/80 transition">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">User Profile</h1>
                    <p className="text-[var(--text-secondary)]">Manage details for {user.name}</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Profile Card */}
                <div className="space-y-6">
                    <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
                        {user.banned && (
                            <div className="absolute top-0 left-0 w-full bg-red-500/10 text-red-500 text-xs font-bold py-1 uppercase tracking-widest">
                                Banned
                            </div>
                        )}

                        <div className="w-24 h-24 rounded-full bg-[var(--background-secondary)] mx-auto mb-4 relative overflow-hidden border-2 border-[var(--border-color)] mt-4">
                            {user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[var(--primary)]">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                        <div className="flex justify-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                {user.role}
                            </span>
                        </div>

                        <UserActionButtons
                            userId={user.id}
                            email={user.email}
                            isBanned={!!(user as any).banned}
                        />
                    </div>

                    <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text-muted)]">Contact Info</h3>

                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                            <span>{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                            <span>Joined {formatDate(user.createdAt)}</span>
                        </div>

                        <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                                <span>Last Active: {formatDate(user.lastActiveAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Activity */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)] text-sm">
                                <Trophy className="w-4 h-4" />
                                <span>Total Points</span>
                            </div>
                            <p className="text-2xl font-bold">{user.points.toLocaleString()}</p>
                        </div>
                        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)] text-sm">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span>Current Streak</span>
                            </div>
                            <p className="text-2xl font-bold">{user.currentStreak || 0} Days</p>
                        </div>
                        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)] text-sm">
                                <PlayCircle className="w-4 h-4 text-blue-500" />
                                <span>Completion</span>
                            </div>
                            <p className="text-2xl font-bold">{progressPercentage}%</p>
                        </div>
                    </div>

                    {/* Recent Progress */}
                    <UserLearningHistory history={historyWithDetails as any} />
                </div>
            </div>
        </div>
    );
}
