import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle, Eye } from 'lucide-react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LessonContentRenderer from '@/components/learning/LessonContentRenderer';
import LessonCompleteButton from '@/components/learning/LessonCompleteButton';
import LessonUpdateWatcher from '@/components/learning/LessonUpdateWatcher';
import { getLessonById } from '@/lib/lessons';
import { ErrorBoundary } from 'react-error-boundary';
import LessonErrorFallback from '@/components/learning/LessonErrorFallback';

interface LessonPageProps {
    params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
    const session = await auth();
    const { lessonId } = await params;

    if (!session?.user) {
        redirect('/login');
    }

    // Check if user is admin (preview mode)
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';

    // Fetch lesson data directly
    const data = await getLessonById(lessonId, session?.user?.id);

    if (!data) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-2">Lesson Not Found</h1>
                <Link href="/tracks" className="btn-primary mt-4">
                    Back to Tracks
                </Link>
            </div>
        );
    }

    const { lesson, navigation } = data;

    const isCompleted = lesson.userProgress?.status === 'COMPLETED';
    const trackSlug = lesson.module.track.slug;

    return (
        <div className="space-y-6">
            {/* Admin Preview Mode Banner */}
            {isAdmin && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Eye className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-semibold">Preview Mode</p>
                        <p className="text-sm text-amber-400/80">You are viewing this lesson as an admin. Your progress will NOT be saved.</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex bg-[var(--background-secondary)]/50 p-4 rounded-2xl border border-[var(--border-color)] items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/tracks/${trackSlug}`}
                        className="p-2 rounded-full hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] text-[var(--text-secondary)] transition-colors"
                        title="Back to Track"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                                Module: {lesson.module.name}
                            </span>
                            {isCompleted && !isAdmin && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Completed
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold">{lesson.title}</h1>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 flex-col lg:flex-row">
                {/* Main Content */}
                <div className="flex-1">

                    {/* Real-time Update Watcher */}
                    <LessonUpdateWatcher
                        lessonId={lessonId}
                        initialUpdatedAt={lesson.updatedAt}
                    />

                    {/* Content Renderer */}
                    <div className="mb-8">
                        <ErrorBoundary
                            FallbackComponent={LessonErrorFallback}
                            onReset={() => {
                                // Optional: Reset logic (like clearing cache) if needed
                            }}
                        >
                            <LessonContentRenderer
                                contentType={lesson.contentType}
                                contentData={lesson.contentData}
                                lessonId={lesson.id}
                                lessonTitle={lesson.title}
                                isPreviewMode={isAdmin}
                                currentSubmission={lesson.currentSubmission}
                                userProgress={lesson.userProgress}
                                navigation={navigation}
                            />
                        </ErrorBoundary>
                    </div>

                    {/* Action Buttons - Hide for Assignments as they have their own submission flow */}
                    {lesson.contentType !== 'ASSIGNMENT' && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 glass-card">
                            <div className="flex items-center gap-2">
                                {isAdmin ? (
                                    <span className="text-amber-400 text-sm">
                                        Preview mode - progress not tracked
                                    </span>
                                ) : (
                                    <span className="text-[var(--text-secondary)]">
                                        Earn <strong className="text-[var(--primary-light)]">+{lesson.pointsValue} points</strong> for completing this lesson
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {!isCompleted && !isAdmin && lesson.contentType !== 'QUIZ' && lesson.contentType !== 'ASSIGNMENT' && (
                                    <LessonCompleteButton
                                        lessonId={lessonId}
                                        lessonTitle={lesson.title}
                                        contentType={lesson.contentType}
                                    />
                                )}
                                {/* Only show Next Lesson button if current lesson is completed or if admin */}
                                {navigation.next && (isCompleted || isAdmin) && (
                                    <Link
                                        href={`/lessons/${navigation.next.id}`}
                                        className="btn-primary"
                                    >
                                        Next Lesson
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Generic Navigation Footer - HIDE for Assignments (handled internally) */}
                    {lesson.contentType !== 'ASSIGNMENT' && (
                        <div className="flex items-center justify-between mt-8 pt-8 border-t border-[var(--border-color)]">
                            {navigation.prev ? (
                                <Link
                                    href={`/lessons/${navigation.prev.id}`}
                                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <div className="text-left">
                                        <p className="text-xs text-[var(--text-muted)]">Previous</p>
                                        <p className="font-medium">{navigation.prev.title}</p>
                                    </div>
                                </Link>
                            ) : <div />}

                            {(navigation.next && (isCompleted || isAdmin)) ? (
                                <Link
                                    href={`/lessons/${navigation.next.id}`}
                                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-right"
                                >
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Next</p>
                                        <p className="font-medium">{navigation.next.title}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            ) : <div />}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
