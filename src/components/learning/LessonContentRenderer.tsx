'use client';

import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });
import PdfViewer from './content/PdfViewer';
import QuizRunner from './content/QuizRunner';
import AssignmentView from './content/AssignmentView';

interface LessonContentRendererProps {
    contentType: string;
    contentData: any;
    lessonId?: string;
    lessonTitle?: string;
    isPreviewMode?: boolean;
    currentSubmission?: any;
    userProgress?: any;
    navigation?: any; // Passed for custom layout handling (e.g. Assignment)
}

export default function LessonContentRenderer({
    contentType,
    contentData,
    lessonId,
    lessonTitle,
    isPreviewMode = false,
    currentSubmission,
    userProgress,
    navigation
}: LessonContentRendererProps) {
    if (!contentData) return null;

    switch (contentType) {
        case 'VIDEO':
            return (
                <VideoPlayer
                    youtubeUrl={contentData.youtube_url}
                    videoUrl={contentData.video_url || contentData.url}
                />
            );

        case 'PDF':
            return (
                <PdfViewer
                    url={contentData.file_url || contentData.pdf_url || contentData.url}
                    title={lessonTitle}
                />
            );

        case 'QUIZ':
            return (
                <QuizRunner
                    data={contentData}
                    lessonId={lessonId}
                    lessonTitle={lessonTitle}
                    isPreviewMode={isPreviewMode}
                    initialScore={userProgress?.quizScore}
                    isCompleted={userProgress?.status === 'COMPLETED'}
                />
            );

        case 'ASSIGNMENT':
            return (
                <AssignmentView
                    data={contentData}
                    lessonId={lessonId!}
                    currentSubmission={currentSubmission}
                    navigation={navigation}
                />
            );

        default:
            return (
                <div className="glass-card p-6">
                    <p className="text-[var(--text-muted)]">
                        Content type &quot;{contentType}&quot; is not yet supported.
                    </p>
                </div>
            );
    }
}
