"use client";

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AssignmentUploaderProps {
    lessonId: string;
    onComplete: () => void;
    currentSubmission?: {
        fileName?: string;
        files?: string;
        link?: string;
        comment?: string;
        submittedAt: string;
        status: string;
    } | null;
}

interface FileUploadState {
    file: File;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
    url?: string;
}

export default function AssignmentUploader({ lessonId, onComplete, currentSubmission }: AssignmentUploaderProps) {
    const [files, setFiles] = useState<FileUploadState[]>([]);
    const [link, setLink] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submission, setSubmission] = useState(currentSubmission);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                status: 'pending' as const,
                progress: 0
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        const uploadedFiles: { name: string; url: string }[] = [];

        // Upload each pending file
        const updateFileStatus = (index: number, updates: Partial<FileUploadState>) => {
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
        };

        for (let i = 0; i < files.length; i++) {
            const fileState = files[i];

            // Skip already uploaded or if we have a URL (from previous session logic if we implemented restoration)
            if (fileState.status === 'completed' && fileState.url) {
                uploadedFiles.push({ name: fileState.file.name, url: fileState.url });
                continue;
            }

            try {
                updateFileStatus(i, { status: 'uploading', progress: 10 });

                // 1. Get Presigned URL
                const presignRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: fileState.file.name,
                        contentType: fileState.file.type
                    })
                });

                if (!presignRes.ok) throw new Error('Failed to get upload URL');
                const { uploadUrl, fileUrl } = await presignRes.json();

                updateFileStatus(i, { progress: 40 });

                // 2. Upload to R2
                const uploadRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: fileState.file,
                    headers: { 'Content-Type': fileState.file.type }
                });

                if (!uploadRes.ok) throw new Error('Upload failed');

                updateFileStatus(i, { status: 'completed', progress: 100, url: fileUrl });
                uploadedFiles.push({ name: fileState.file.name, url: fileUrl });

            } catch (error) {
                console.error(error);
                updateFileStatus(i, { status: 'error' });
                throw new Error(`Failed to upload ${fileState.file.name}`);
            }
        }

        return uploadedFiles;
    };

    const handleSubmit = async () => {
        if (files.length === 0 && !link.trim() && !comment.trim()) {
            // Allow skip? Parent handles skip logic with a separate button usually, but here we can just "Mark Complete" if empty?
            // User requested "can upload not only one file", implying mandatory if they are submitting.
            // But we can allow submitting just a comment.
            toast.error('Please attach a file, link, or comment to submit.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Upload all files first
            const uploadedFileData = await uploadFiles();

            // 2. Submit Assignment Record
            const payload = {
                lessonId,
                files: JSON.stringify(uploadedFileData),
                link: link.trim(),
                comment: comment.trim()
            };

            const submitRes = await fetch('/api/assignment/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!submitRes.ok) throw new Error('Failed to record submission');

            toast.success('Assignment submitted successfully!');

            setSubmission({
                submittedAt: new Date().toISOString(),
                status: 'SUBMITTED',
                // Optimistic update display
                files: JSON.stringify(uploadedFileData),
                link: link.trim(),
                comment: comment.trim()
            });

            setFiles([]);
            setLink('');
            setComment('');
            onComplete();

        } catch (error) {
            console.error(error);
            toast.error('Failed to submit assignment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submission) {
        // Parse files if JSON string
        let displayFiles: { name: string, url: string }[] = [];
        try {
            if (submission.files) {
                displayFiles = JSON.parse(submission.files);
            } else if (submission.fileName) {
                // Backwards compatibility
                displayFiles = [{ name: submission.fileName, url: '#' }];
            }
        } catch (e) { displayFiles = [] }

        return (
            <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Assignment Submitted</h3>
                <p className="text-[var(--text-muted)] mb-6">
                    Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                </p>

                <div className="text-left bg-[var(--background-secondary)]/30 rounded-xl p-4 mb-6 space-y-3">
                    {displayFiles.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Attachments</p>
                            <div className="space-y-2">
                                {displayFiles.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                                        <FileText className="w-4 h-4 text-[var(--primary)]" />
                                        <span className="truncate">{f.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {submission.link && (
                        <div>
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 mt-3">Link</p>
                            <a href={submission.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                                <LinkIcon className="w-4 h-4" />
                                <span className="truncate">{submission.link}</span>
                            </a>
                        </div>
                    )}

                    {submission.comment && (
                        <div>
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 mt-3">Private Comment</p>
                            <div className="text-sm text-[var(--text-secondary)] italic border-l-2 border-[var(--border-color)] pl-3">
                                "{submission.comment}"
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setSubmission(undefined)} // Allow re-submit
                        className="btn-secondary"
                    >
                        Update Submission
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 max-w-2xl mx-auto space-y-6">
            <div>
                <h3 className="text-xl font-bold mb-2">Submit Assignment</h3>
                <p className="text-[var(--text-muted)] text-sm">
                    Upload your work, add a link, or leave a comment for your instructor.
                </p>
            </div>

            {/* File Upload Section */}
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${isSubmitting ? 'opacity-50 pointer-events-none' : 'border-[var(--border-color)] hover:border-[var(--primary)] hover:bg-[var(--background-secondary)]'}`}>
                <input
                    type="file"
                    id="assignment-file"
                    className="hidden"
                    onChange={handleFileSelect}
                    multiple
                    disabled={isSubmitting}
                />

                <label htmlFor="assignment-file" className="cursor-pointer flex flex-col items-center gap-3 py-4">
                    <div className="w-12 h-12 bg-[var(--background-secondary)] rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-[var(--text-muted)]" />
                    </div>
                    <div>
                        <p className="font-medium text-[var(--primary)]">Click to upload files</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">or drag and drop (Max 50MB)</p>
                    </div>
                </label>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((fileState, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)]">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded bg-[var(--surface)] flex items-center justify-center text-[var(--primary)]">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{fileState.file.name}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{(fileState.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {fileState.status === 'uploading' && <span className="text-xs text-[var(--text-muted)]">{fileState.progress}%</span>}
                                {fileState.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {fileState.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                <button onClick={() => removeFile(index)} disabled={isSubmitting} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Link Input */}
            <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Submission Link <span className="text-[var(--text-muted)] font-normal ml-auto text-xs">(Google Drive, GitHub, etc.)</span>
                </label>
                <input
                    type="url"
                    placeholder="https://"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    disabled={isSubmitting}
                    className="input-field w-full text-sm"
                />
            </div>

            {/* Comment Input */}
            <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Private Comment
                </label>
                <textarea
                    placeholder="Add a private comment for your instructor..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                    className="input-field w-full h-24 text-sm resize-none"
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    onClick={onComplete}
                    className="btn-ghost text-sm"
                    disabled={isSubmitting}
                >
                    Skip & Mark Complete
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (files.length === 0 && !link && !comment)}
                    className="btn-primary"
                >
                    {isSubmitting ? 'Turning in...' : 'Turn In Assignment'}
                </button>
            </div>
        </div>
    );
}
