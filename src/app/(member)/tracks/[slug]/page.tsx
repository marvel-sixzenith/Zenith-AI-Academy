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
    Trophy
} from 'lucide-react';
import clsx from 'clsx';
import { Card } from '@/components/ui/Card';

interface PageProps {
    params: Promise<{ slug: string }>;
}

const typeIconMap = {
    VIDEO: PlayCircle,
    PDF: FileText,
    QUIZ: BrainCircuit,
    ASSIGNMENT: FileText,
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
                                const TypeIcon = typeIconMap[lesson.contentType as keyof typeof typeIconMap] || FileText;
                                const isLocked = lesson.unlockStatus === 'LOCKED' && lesson.userStatus !== 'COMPLETED'; // userStatus 'COMPLETED' overrides lock
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
                                                : "bg-[var(--background-card)] border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:shadow-lg hover:shadow-[var(--primary)]/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                                isCompleted ? "bg-[var(--success)]/10 text-[var(--success)]" :
                                                    isLocked ? "bg-[var(--background-secondary)] text-[var(--text-muted)]" :
                                                        "bg-[var(--primary)]/10 text-[var(--primary)]"
                                            )}>
                                                {isCompleted ? <CheckCircle className="w-5 h-5" /> :
                                                    isLocked ? <Lock className="w-5 h-5" /> :
                                                        <TypeIcon className="w-5 h-5" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--text-muted)] uppercase tracking-wider">
                                                        {lesson.contentType}
                                                    </span>
                                                    {isCompleted && (
                                                        <span className="text-xs font-medium text-[var(--success)] flex items-center gap-1">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={clsx(
                                                    "font-medium truncate",
                                                    isLocked ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
                                                )}>
                                                    {lesson.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                                <div className="flex items-center gap-1">
                                                    <Trophy className="w-4 h-4" />
                                                    <span>{lesson.pointsValue} pts</span>
                                                </div>
                                                {!isLocked && (
                                                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-transform group-hover:translate-x-1" />
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
