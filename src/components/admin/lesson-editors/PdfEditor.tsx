'use client';

import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface PdfEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function PdfEditor({ value, onChange }: PdfEditorProps) {
    let initialUrl = '';
    try {
        const parsed = JSON.parse(value);
        if (parsed.file_url) initialUrl = parsed.file_url;
    } catch {
        initialUrl = value === '{}' ? '' : value;
    }

    const [url, setUrl] = useState(initialUrl);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'pdfs');

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setUrl(data.url);
                onChange(JSON.stringify({
                    type: 'pdf',
                    file_url: data.url
                }));
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const clearFile = () => {
        setUrl('');
        onChange('{}');
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Upload PDF Document</label>

                {url ? (
                    <div className="flex items-center gap-3 p-3 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-color)]">
                        <div className="p-2 bg-red-500/10 text-red-500 rounded text-sm">PDF</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{url.split('/').pop()}</p>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline">
                                View File
                            </a>
                        </div>
                        <button
                            type="button"
                            onClick={clearFile}
                            className="p-1 hover:bg-white/10 rounded"
                        >
                            <X className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                    </div>
                ) : (
                    <div className="border border-dashed border-[var(--border-color)] rounded-lg p-8 text-center bg-[var(--background-secondary)]/50">
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="loading-spinner w-6 h-6 border-2" />
                                <span className="text-sm text-[var(--text-muted)]">Uploading PDF...</span>
                            </div>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-[var(--text-muted)]" />
                                <span className="text-sm font-medium">Click to upload PDF</span>
                                <span className="text-xs text-[var(--text-muted)]">Max 10MB</span>
                                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                            </label>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
