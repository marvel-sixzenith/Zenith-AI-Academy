'use client';

import { FileText, ExternalLink, Download } from 'lucide-react';

interface PdfViewerProps {
    url: string;
}

export default function PdfViewer({ url, title }: { url: string, title?: string }) {
    if (!url) return null;

    return (
        <div className="flex flex-col gap-6 w-full md:w-1/2 mx-auto">
            <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
                        <FileText className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{title || 'PDF Document'}</h3>
                        <p className="text-sm text-[var(--text-muted)]">Read carefully or download for later</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href={url}
                        download
                        className="btn-secondary flex items-center gap-2"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                    </a>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Open New Tab
                    </a>
                </div>
            </div>

            {/* Added resize to allow user to adjust width and height */}
            <div className="glass-card p-2 overflow-hidden h-[85vh] min-h-[600px] bg-[var(--surface)] resize">
                <iframe
                    src={`${url}#toolbar=1&view=FitH`}
                    className="w-full h-full rounded-xl bg-white"
                    title="PDF Viewer"
                />
            </div>
        </div>
    );
}
