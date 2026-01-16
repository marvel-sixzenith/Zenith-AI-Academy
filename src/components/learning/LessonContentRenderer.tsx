import VideoPlayer from './VideoPlayer';

interface LessonContentRendererProps {
    contentType: string;
    contentData: any;
}

export default function LessonContentRenderer({ contentType, contentData }: LessonContentRendererProps) {
    switch (contentType) {
        case 'VIDEO':
            return (
                <VideoPlayer
                    youtubeUrl={contentData.youtube_url || contentData.url}
                />
            );

        case 'PDF':
            return (
                <div className="glass-card p-6">
                    <iframe
                        src={contentData.pdf_url || contentData.url}
                        className="w-full h-[600px] rounded-lg"
                        title="PDF Viewer"
                    />
                </div>
            );

        case 'QUIZ':
            return (
                <div className="glass-card p-6">
                    <p className="text-[var(--text-muted)] mb-4">
                        Quiz interface will be rendered here. Questions: {contentData.questions?.length || 0}
                    </p>
                    {/* Quiz component would go here */}
                </div>
            );

        case 'ASSIGNMENT':
            return (
                <div className="glass-card p-6">
                    <div className="prose prose-invert max-w-none">
                        <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
                            {contentData.description || contentData.instructions}
                        </p>
                        {contentData.checklist && (
                            <div className="mt-6">
                                <h3 className="text-lg font-bold mb-3">Checklist:</h3>
                                <ul className="space-y-2">
                                    {contentData.checklist.map((item: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-[var(--primary)]">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
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
