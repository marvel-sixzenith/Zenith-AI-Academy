import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getTrackBySlug } from '@/lib/tracks';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    PlayCircle,
    FileText,
    BrainCircuit,
    Lock,
    Clock,
    Trophy,
    Video,
    FileCode,
    FileType
} from 'lucide-react';
import clsx from 'clsx';
import { Card } from '@/components/ui/Card';

interface PageProps {
    params: Promise<{ slug: string }>;
}

const TYPE_CONFIG = {
    VIDEO: {
        icon: Video,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        hoverBorder: 'group-hover:border-blue-500/50',
        label: 'Video'
    },
    QUIZ: {
        icon: BrainCircuit,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        hoverBorder: 'group-hover:border-purple-500/50',
        label: 'Quiz'
    },
    ASSIGNMENT: {
        icon: FileCode,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        hoverBorder: 'group-hover:border-orange-500/50',
        label: 'Assignment'
    },
    PDF: {
        icon: FileType,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        hoverBorder: 'group-hover:border-red-500/50',
        label: 'PDF'
    },
    DEFAULT: {
        icon: FileText,
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
        hoverBorder: 'group-hover:border-gray-500/50',
        label: 'Lesson'
    }
};

export default async function TrackPage({ params }: PageProps) {
    const session = await auth();
    const { slug } = await params;
    const userId = session?.user?.id;

    if (!userId) {
        return null; // Should be handled by layout/middleware
    }

    const track = await getTrackBySlug(slug, userId);

    if (!track) {
        notFound();
    }

    if (track.isLocked) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </Link>
                <Card className="p-8 text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 rounded-full bg-[var(--background-secondary)] flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Track Locked</h1>
                    <p className="text-[var(--text-secondary)]">
                        {(track as any).lockReason || 'Please complete the prerequisite track first.'}
                    </p>
                </Card>
            </div>
        );
    }

    // Calculate overall progress
    const allLessons = track.modules.flatMap(m => m.lessons);
    const completedCount = allLessons.filter(l => l.userStatus === 'COMPLETED').length;
    const progressPercent = Math.round((completedCount / allLessons.length) * 100) || 0;

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in space-y-8">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{track.name}</h1>
                        <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
                            {track.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-[var(--background-card)] p-4 rounded-xl border border-[var(--border-color)]">
                        <div className="text-center">
                            <p className="text-sm text-[var(--text-muted)]">Progress</p>
                            <p className="text-xl font-bold text-[var(--primary)]">{progressPercent}%</p>
                        </div>
                        <div className="w-px h-8 bg-[var(--border-color)]" />
                        <div className="text-center">
                            <p className="text-sm text-[var(--text-muted)]">Completed</p>
                            <p className="text-xl font-bold">{completedCount}/{allLessons.length}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden mb-10">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Modules List */}
            <div className="space-y-6 max-w-4xl mx-auto">
                {track.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="relative">
                        {/* Connecting Line */}
                        {moduleIndex < track.modules.length - 1 && (
                            <div className="absolute left-6 top-16 bottom-0 w-px bg-[var(--border-color)] -z-10" />
                        )}

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--background-secondary)] flex items-center justify-center shrink-0 font-bold border border-[var(--border-color)]">
                                {moduleIndex + 1}
                            </div>
                            <div className="flex-1 pt-1">
                                <h2 className="text-xl font-bold mb-1">{module.name}</h2>
                                {module.description && (
                                    <p className="text-[var(--text-muted)]">{module.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="pl-16 space-y-3 mb-10">
                            {module.lessons.map((lesson) => {
                                const typeConfig = TYPE_CONFIG[lesson.contentType as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.DEFAULT;
                                const TypeIcon = typeConfig.icon;

                                const isLocked = lesson.unlockStatus === 'LOCKED' && lesson.userStatus !== 'COMPLETED';
                                const isCompleted = lesson.userStatus === 'COMPLETED';

                                // Determine interactivity
                                const Element = isLocked ? 'div' : Link;
                                const href = isLocked ? undefined : `/lessons/${lesson.id}`;

                                return (
                                    <Element
                                        key={lesson.id}
                                        href={href as string}
                                        className={clsx(
                                            "block p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                                            isLocked
                                                ? "bg-[var(--background-secondary)]/30 border-[var(--border-color)] opacity-75 cursor-not-allowed"
                                                : isCompleted
                                                    ? `bg-[var(--background-card)] ${typeConfig.borderColor} border-opacity-50`
                                                    : `bg-[var(--background-card)] border-[var(--border-color)] ${typeConfig.hoverBorder} hover:shadow-lg`
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Status/Type Icon Box */}
                                            <div className={clsx(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                                isCompleted
                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                    : isLocked
                                                        ? "bg-[var(--background-secondary)] text-[var(--text-muted)]"
                                                        : `${typeConfig.bgColor} ${typeConfig.color}`
                                            )}>
                                                {isCompleted
                                                    ? <CheckCircle className="w-6 h-6" />
                                                    : isLocked
                                                        ? <Lock className="w-5 h-5" />
                                                        : <TypeIcon className="w-6 h-6" />
                                                }
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={clsx(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border",
                                                        isCompleted
                                                            ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                                                            : isLocked
                                                                ? "bg-[var(--background-secondary)] text-[var(--text-muted)] border-transparent"
                                                                : `${typeConfig.bgColor} ${typeConfig.color} ${typeConfig.borderColor}`
                                                    )}>
                                                        {typeConfig.label}
                                                    </span>
                                                    {isCompleted && (
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={clsx(
                                                    "font-medium truncate text-lg",
                                                    isLocked ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
                                                )}>
                                                    {lesson.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                                <div className="flex items-center gap-1 bg-[var(--background-secondary)] px-2 py-1 rounded-md">
                                                    <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                                    <span className="font-medium">{lesson.pointsValue} pts</span>
                                                </div>
                                                {!isLocked && !isCompleted && (
                                                    <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${typeConfig.color}`} />
                                                )}
                                                {isCompleted && (
                                                    <div className="w-5 h-5" /> // Spacer
                                                )}
                                            </div>
                                        </div>
                                    </Element>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
