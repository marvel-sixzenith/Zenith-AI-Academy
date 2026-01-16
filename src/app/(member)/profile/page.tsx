
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { User, Mail, Calendar, Trophy, BookOpen, Clock } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            _count: {
                select: {
                    progress: { where: { status: 'COMPLETED' } }
                }
            }
        }
    });

    if (!user) return null;

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold mb-2">Profil Saya</h1>
                <p className="text-[var(--text-secondary)]">
                    Kelola informasi pribadi dan pantau pencapaian Anda.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="md:col-span-1 border border-[var(--border-color)] bg-[var(--background-card)] rounded-2xl p-6 h-fit">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] text-3xl font-bold mb-4">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-[var(--text-secondary)] text-sm mb-4">{user.email}</p>

                        <div className="w-full pt-4 border-t border-[var(--border-color)] flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                                <Calendar className="w-4 h-4" />
                                <span>Bergabung {user.createdAt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="w-5 h-5 text-[var(--warning)]" />
                                <span className="text-sm text-[var(--text-muted)]">Total Poin</span>
                            </div>
                            <p className="text-2xl font-bold">{user.points}</p>
                        </div>
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <BookOpen className="w-5 h-5 text-[var(--primary)]" />
                                <span className="text-sm text-[var(--text-muted)]">Pelajaran Selesai</span>
                            </div>
                            <p className="text-2xl font-bold">{user._count.progress}</p>
                        </div>
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <User className="w-5 h-5 text-[var(--success)]" />
                                <span className="text-sm text-[var(--text-muted)]">Role</span>
                            </div>
                            <p className="text-2xl font-bold capitalize text-sm">{user.role.toLowerCase()}</p>
                        </div>
                    </div>

                    {/* Additional sections can go here, e.g., Recent Activity, Settings Form */}
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4">Pengaturan Akun</h3>
                        <p className="text-[var(--text-secondary)] text-sm mb-4">
                            Saat ini pengaturan akun dikelola oleh administrator. Hubungi support untuk perubahan data sensitif.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
