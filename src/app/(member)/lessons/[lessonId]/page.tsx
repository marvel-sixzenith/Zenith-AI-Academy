import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle, X } from 'lucide-react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LessonContentRenderer from '@/components/learning/LessonContentRenderer';
import LessonCompleteButton from '@/components/learning/LessonCompleteButton';
import { getLessonById } from '@/lib/lessons';

interface LessonPageProps {
    params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
    const session = await auth();
    const { lessonId } = await params;

    if (!session?.user) {
        redirect('/login');
    }

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
        <div className="min-h-screen -m-6">
            {/* Top Bar */}
            <div className="h-14 bg-[var(--background-secondary)] border-b border-[var(--border-color)] flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/tracks/${trackSlug}`}
                        className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back to Track</span>
                    </Link>
                    <div className="h-6 w-px bg-[var(--border-color)]" />
                    <div className="hidden md:block">
                        <p className="text-sm text-[var(--text-muted)]">{lesson.module.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isCompleted && (
                        <span className="badge badge-success flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                        </span>
                    )}
                </div>
            </div>

            <div className="flex">
                {/* Main Content */}
                <div className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Lesson Title */}
                        <h1 className="text-2xl md:text-3xl font-bold mb-6">{lesson.title}</h1>

                        {/* Content Renderer */}
                        <div className="mb-8">
                            <LessonContentRenderer
                                contentType={lesson.contentType}
                                contentData={lesson.contentData}
                                lessonId={lesson.id}
                                lessonTitle={lesson.title}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 glass-card">
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--text-secondary)]">
                                    Earn <strong className="text-[var(--primary-light)]">+{lesson.pointsValue} points</strong> for completing this lesson
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {!isCompleted && lesson.contentType !== 'QUIZ' && (
                                    <LessonCompleteButton
                                        lessonId={lessonId}
                                        lessonTitle={lesson.title}
                                        contentType={lesson.contentType}
                                    />
                                )}
                                {navigation.next && (
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

                        {/* Navigation */}
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

                            {navigation.next ? (
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
                    </div>
                </div>
            </div>
        </div>
    );
}
