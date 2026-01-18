'use client';

import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

interface AssignmentEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function AssignmentEditor({ value, onChange }: AssignmentEditorProps) {
    const [instructions, setInstructions] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        try {
            const parsed = JSON.parse(value);
            if (parsed.type === 'assignment') {
                setInstructions(parsed.instructions || '');
                setAttachmentUrl(parsed.attachment || '');
            }
        } catch {
            // ignore
        }
    }, []);

    const updateData = (newInstructions: string, newAttachment: string) => {
        setInstructions(newInstructions);
        setAttachmentUrl(newAttachment);
        onChange(JSON.stringify({
            type: 'assignment',
            instructions: newInstructions,
            attachment: newAttachment
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'assignments');

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                updateData(instructions, data.url);
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
            <div>
                <label className="block text-sm font-medium mb-2">Instructions</label>
                <textarea
                    value={instructions}
                    onChange={(e) => updateData(e.target.value, attachmentUrl)}
                    className="input-field min-h-[150px]"
                    placeholder="Describe the assignment task..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Reference Material (Optional)</label>
                {attachmentUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-color)] w-max">
                        <div className="flex-1 min-w-0 pr-4">
                            <span className="text-sm font-medium truncate block max-w-xs">{attachmentUrl.split('/').pop()}</span>
                            <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline">
                                View File
                            </a>
                        </div>
                        <button
                            type="button"
                            onClick={() => updateData(instructions, '')}
                            className="p-1 hover:bg-white/10 rounded"
                        >
                            <X className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                    </div>
                ) : (
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--background-secondary)] transition">
                        {isUploading ? (
                            <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">Upload Reference File</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                )}
            </div>
        </div>
    );
}
