'use client';

import { FileText, ExternalLink } from 'lucide-react';

interface PdfViewerProps {
    url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
    if (!url) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">PDF Document</p>
                        <p className="text-xs text-[var(--text-muted)]">View directly or download</p>
                    </div>
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs flex items-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                </a>
            </div>

            <div className="glass-card p-1 overflow-hidden h-[600px] bg-white">
                <iframe
                    src={`${url}#toolbar=0`}
                    className="w-full h-full rounded-lg"
                    title="PDF Viewer"
                />
            </div>
        </div>
    );
}
