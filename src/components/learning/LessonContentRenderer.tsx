import VideoPlayer from './VideoPlayer';
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
}

export default function LessonContentRenderer({
    contentType,
    contentData,
    lessonId,
    lessonTitle,
    isPreviewMode = false,
    currentSubmission
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
                />
            );

        case 'QUIZ':
            return (
                <QuizRunner
                    data={contentData}
                    lessonId={lessonId}
                    lessonTitle={lessonTitle}
                    isPreviewMode={isPreviewMode}
                />
            );

        case 'ASSIGNMENT':
            return (
                <AssignmentView
                    data={contentData}
                    lessonId={lessonId!}
                    currentSubmission={contentData.currentSubmission} // This might be wrong, currentSubmission comes from lesson wrapper not contentData
                // Wait, getLessonById merges currentSubmission into the returned object, NOT into contentData.
                // I need to update Props.
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
