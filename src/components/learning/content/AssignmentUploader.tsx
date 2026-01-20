"use client";

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AssignmentUploaderProps {
    lessonId: string;
    onComplete: () => void;
    currentSubmission?: {
        fileName: string;
        submittedAt: string;
        status: string;
    } | null;
}

export default function AssignmentUploader({ lessonId, onComplete, currentSubmission }: AssignmentUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submission, setSubmission] = useState(currentSubmission);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(10); // Start progress

        try {
            // 1. Get Presigned URL
            const presignRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type
                })
            });

            if (!presignRes.ok) throw new Error('Failed to get upload URL');
            const { uploadUrl, fileUrl, fileName } = await presignRes.json();

            setUploadProgress(30);

            // 2. Upload to R2
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!uploadRes.ok) throw new Error('Upload to storage failed');

            setUploadProgress(80);

            // 3. Submit Assignment Record
            const submitRes = await fetch('/api/assignment/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    fileUrl,
                    fileName
                })
            });

            if (!submitRes.ok) throw new Error('Failed to record submission');

            setUploadProgress(100);
            toast.success('Assignment submitted successfully!');

            setSubmission({
                fileName: fileName,
                submittedAt: new Date().toISOString(),
                status: 'SUBMITTED'
            });
            setFile(null);
            onComplete(); // Trigger parent completion logic (e.g. confetti, next lesson)

        } catch (error) {
            console.error(error);
            toast.error('Failed to submit assignment. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    if (submission) {
        return (
            <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Assignment Submitted</h3>
                <p className="text-[var(--text-muted)] mb-6">
                    You submitted <span className="font-mono text-[var(--primary)]">{submission.fileName}</span> on {new Date(submission.submittedAt).toLocaleDateString()}.
                </p>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setSubmission(undefined)} // Allow re-upload
                        className="btn-secondary"
                    >
                        Resubmit Assignment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-2">Submit Assignment</h3>
            <p className="text-[var(--text-muted)] mb-6 text-sm">
                Upload your work related to this lesson. Supported formats: PDF, ZIP, Images. Max size: 50MB.
                <br />
                <span className="opacity-75 italic">* Upload is optional. You can also skip this if not required.</span>
            </p>

            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isUploading ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border-color)] hover:border-[var(--primary)] hover:bg-[var(--background-secondary)]'
                }`}>
                <input
                    type="file"
                    id="assignment-file"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />

                {!file ? (
                    <label htmlFor="assignment-file" className="cursor-pointer flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[var(--background-secondary)] rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-[var(--text-muted)]" />
                        </div>
                        <div>
                            <p className="font-medium text-[var(--primary)]">Click to upload</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">or drag and drop here</p>
                        </div>
                    </label>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[var(--primary)]" />
                        </div>
                        <div>
                            <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {!isUploading && (
                            <button
                                onClick={() => setFile(null)}
                                className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                            >
                                <X className="w-3 h-3" /> Remove
                            </button>
                        )}
                    </div>
                )}
            </div>

            {isUploading && (
                <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-medium text-[var(--text-muted)]">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--background-secondary)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--primary)] transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
                {!file && (
                    <button
                        onClick={onComplete}
                        className="btn-ghost text-sm"
                    >
                        Skip & Mark Complete
                    </button>
                )}
                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="btn-primary"
                >
                    {isUploading ? 'Uploading...' : 'Submit Assignment'}
                </button>
            </div>
        </div>
    );
}
