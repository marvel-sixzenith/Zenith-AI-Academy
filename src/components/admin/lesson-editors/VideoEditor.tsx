'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface VideoEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function VideoEditor({ value, onChange }: VideoEditorProps) {
    // Parse initial state
    let initialMode: 'url' | 'upload' = 'url';
    let initialUrl = '';

    try {
        const parsed = JSON.parse(value);
        if (parsed.youtube_url) {
            initialUrl = parsed.youtube_url;
            initialMode = 'url';
        } else if (parsed.video_url) { // Handle potential direct video links
            initialUrl = parsed.video_url;
            initialMode = 'upload'; // Assuming direct links might imply uploads, but safe default
        }
    } catch {
        // If plain string, assume it's a URL
        initialUrl = value === '{}' ? '' : value;
    }

    const [mode, setMode] = useState<'url' | 'upload'>(initialMode);
    const [url, setUrl] = useState(initialUrl);
    const [isUploading, setIsUploading] = useState(false);

    const handleUrlChange = (newUrl: string) => {
        setUrl(newUrl);
        // Save as JSON structure
        onChange(JSON.stringify({
            type: 'video',
            youtube_url: newUrl
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'videos');

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setUrl(data.url);
                onChange(JSON.stringify({
                    type: 'video',
                    video_url: data.url // Use different key for direct files if needed, or unify
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

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition ${mode === 'url'
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]'
                        : 'border-[var(--border-color)] hover:bg-[var(--background-secondary)]'
                        }`}
                >
                    <LinkIcon className="w-4 h-4" />
                    YouTube URL
                </button>
                <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition ${mode === 'upload'
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]'
                        : 'border-[var(--border-color)] hover:bg-[var(--background-secondary)]'
                        }`}
                >
                    <Upload className="w-4 h-4" />
                    Upload Video
                </button>
            </div>

            {mode === 'url' ? (
                <div>
                    <label className="block text-sm font-medium mb-2">YouTube URL</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="input-field"
                    />
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium mb-2">Upload Video File (MP4, WebM)</label>
                    <div className="border border-dashed border-[var(--border-color)] rounded-lg p-8 text-center bg-[var(--background-secondary)]/50">
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="loading-spinner w-6 h-6 border-2" />
                                <span className="text-sm text-[var(--text-muted)]">Uploading...</span>
                            </div>
                        ) : url && mode === 'upload' ? (
                            <div className="space-y-3">
                                <p className="text-sm text-[var(--success)]">Video uploaded successfully!</p>
                                <p className="text-xs text-[var(--text-muted)] truncate max-w-xs mx-auto">{url}</p>
                                <label className="btn-secondary text-sm inline-flex items-center gap-2 cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    Replace Video
                                    <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-[var(--text-muted)]" />
                                <span className="text-sm font-medium">Click to upload video</span>
                                <span className="text-xs text-[var(--text-muted)]">Max 500MB</span>
                                <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                            </label>
                        )}
                    </div>
                </div>
            )}

            {url && (
                <div className="mt-2 text-xs text-[var(--text-muted)] flex items-center gap-1.5 opacity-75">
                    <AlertCircle className="w-3 h-3" />
                    Preview: {url}
                </div>
            )}
        </div>
    );
}
