import Link from 'next/link';
import { ChevronRight, Lock, CheckCircle, PlayCircle, FileText, HelpCircle, ClipboardCheck } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getTrackBySlug } from '@/lib/tracks';
import { redirect } from 'next/navigation';

const typeIcons: Record<string, typeof PlayCircle> = {
    VIDEO: PlayCircle,
    PDF: FileText,
    QUIZ: HelpCircle,
    ASSIGNMENT: ClipboardCheck,
};

const statusColors: Record<string, string> = {
    COMPLETED: 'var(--success)',
    IN_PROGRESS: 'var(--primary)',
    UNLOCKED: 'var(--primary)',
    LOCKED: 'var(--text-muted)',
};

interface TrackPageProps {
    params: Promise<{ slug: string }>;
}

export default async function TrackDetailPage({ params }: TrackPageProps) {
    const session = await auth();
    const resolvedParams = await params;

    // Fetch track data directly
    const track = await getTrackBySlug(resolvedParams.slug, session?.user?.id);

    if (!track) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-2">Track Not Found</h1>
                <p className="text-[var(--text-secondary)] mb-6">The track you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/tracks" className="btn-primary">
                    Back to Tracks
                </Link>
            </div>
        );
    }

    // If track is locked, show lock message
    if (track.isLocked) {
        return (
            <div className="text-center py-20">
                <Lock className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Track Locked</h1>
                <p className="text-[var(--text-secondary)] mb-6">{(track as any).lockReason}</p>
                <Link href="/tracks" className="btn-primary">
                    Back to Tracks
                </Link>
            </div>
        );
    }

    const totalLessons = track.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0);
    const completedLessons = track.modules.reduce(
        (acc: number, m: any) => acc + m.lessons.filter((l: any) => l.userStatus === 'COMPLETED').length,
        0
    );
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
                        <Link href="/tracks" className="hover:text-[var(--text-primary)] transition">
                            Tracks
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-[var(--text-primary)]">{track.name}</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{track.name}</h1>
                    <p className="text-[var(--text-secondary)]">{track.description}</p>
                </div>

                {/* Progress Summary */}
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="var(--background-secondary)" strokeWidth="5" fill="none" />
                            <circle
                                cx="32" cy="32" r="28"
                                stroke="var(--primary)"
                                strokeWidth="5"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-bold">{progress}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-lg font-bold">{completedLessons} / {totalLessons}</p>
                        <p className="text-sm text-[var(--text-muted)]">Lessons Completed</p>
                    </div>
                </div>
            </div>

            {/* Modules */}
            <div className="space-y-6">
                {track.modules.map((module: any, moduleIndex: number) => {
                    const moduleCompleted = module.lessons.filter((l: any) => l.userStatus === 'COMPLETED').length;
                    const moduleProgress = module.lessons.length > 0
                        ? Math.round((moduleCompleted / module.lessons.length) * 100)
                        : 0;

                    return (
                        <div key={module.id} className="glass-card overflow-hidden">
                            {/* Module Header */}
                            <div className="p-6 border-b border-[var(--border-color)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="text-sm text-[var(--primary-light)] font-medium">
                                            Module {moduleIndex + 1}
                                        </span>
                                        <h2 className="text-xl font-bold mt-1">{module.name}</h2>
                                        <p className="text-[var(--text-secondary)] text-sm mt-1">{module.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold">{moduleProgress}%</p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {moduleCompleted}/{module.lessons.length} lessons
                                        </p>
                                    </div>
                                </div>
                                <div className="progress-bar mt-4">
                                    <div className="progress-bar-fill" style={{ width: `${moduleProgress}%` }} />
                                </div>
                            </div>

                            {/* Lessons */}
                            <div className="divide-y divide-[var(--border-color)]">
                                {module.lessons.map((lesson: any, lessonIndex: number) => {
                                    const TypeIcon = typeIcons[lesson.contentType] || PlayCircle;
                                    const isLocked = lesson.unlockStatus === 'LOCKED';
                                    const isCompleted = lesson.userStatus === 'COMPLETED';

                                    return (
                                        <Link
                                            key={lesson.id}
                                            href={isLocked ? '#' : `/lessons/${lesson.id}`}
                                            className={`flex items-center gap-4 p-4 hover:bg-[var(--background-card)] transition ${isLocked ? 'cursor-not-allowed opacity-60' : ''
                                                }`}
                                        >
                                            {/* Status Icon */}
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${statusColors[isCompleted ? 'COMPLETED' : isLocked ? 'LOCKED' : 'UNLOCKED']} 15%, transparent)`,
                                                    color: statusColors[isCompleted ? 'COMPLETED' : isLocked ? 'LOCKED' : 'UNLOCKED']
                                                }}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : isLocked ? (
                                                    <Lock className="w-5 h-5" />
                                                ) : (
                                                    <TypeIcon className="w-5 h-5" />
                                                )}
                                            </div>

                                            {/* Lesson Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{lesson.title}</p>
                                                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                                    <TypeIcon className="w-4 h-4" />
                                                    <span className="capitalize">{lesson.contentType.toLowerCase()}</span>
                                                    <span>•</span>
                                                    <span>+{lesson.pointsValue} pts</span>
                                                </div>
                                            </div>

                                            {/* Lesson Number */}
                                            <span className="text-sm text-[var(--text-muted)] shrink-0">
                                                {lessonIndex + 1}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
