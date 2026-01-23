'use client';

import { ClipboardList, CheckSquare, FileText, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import YourWorkCard from './YourWorkCard';
import PrivateCommentSection from './PrivateCommentSection';

interface AssignmentViewProps {
    data: {
        description?: string;
        instructions?: string; // Legacy fallback
        checklist?: string[];
        attachment?: string;
    };
    lessonId: string;
    currentSubmission?: any;
}

export default function AssignmentView({ data, lessonId, currentSubmission }: AssignmentViewProps) {
    const router = useRouter();
    const content = data.description || data.instructions || '';

    const handleUploadComplete = () => {
        router.refresh();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Instructions & Content */}
            <div className="md:col-span-2 space-y-6">

                {/* Header Area */}
                <div className="flex items-start gap-4 pb-6 border-b border-[var(--border-color)]">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Assignment Details</h2>
                        <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)] mt-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                                <span>10 Points</span>
                            </div>
                            {/* Data for due date not yet available in props, hiding for now or static */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--background-secondary)] border border-[var(--border-color)]">
                                <span>Due Next Week</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions Body */}
                <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
                    <p className="whitespace-pre-wrap leading-relaxed text-base">
                        {content}
                    </p>
                </div>

                {/* Checklist Section */}
                {data.checklist && data.checklist.length > 0 && (
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--background-secondary)]/30">
                            <h3 className="font-bold flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
                                Success Checklist
                            </h3>
                        </div>
                        <ul className="divide-y divide-[var(--border-color)]">
                            {data.checklist.map((item, index) => (
                                <li key={index} className="flex items-start gap-3 p-4 hover:bg-[var(--background-secondary)]/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 rounded border-[var(--border-color)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                    />
                                    <span className="text-[var(--text-secondary)] leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Attachments Section */}
                {data.attachment && (
                    <div className="pt-4">
                        <h3 className="font-bold mb-4 text-sm text-[var(--text-muted)] uppercase tracking-wider">
                            Reference Materials
                        </h3>
                        <a
                            href={data.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--background-secondary)] transition group max-w-xl"
                        >
                            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold truncate text-[var(--text-primary)] mb-0.5">
                                    {data.attachment.split('/').pop()}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] uppercase font-semibold">
                                    PDF Document
                                </p>
                            </div>
                            <Download className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
                        </a>
                    </div>
                )}
            </div>

            {/* Right Column - Your Work & Comments */}
            <div className="md:col-span-1 space-y-6">
                <YourWorkCard
                    lessonId={lessonId}
                    onComplete={handleUploadComplete}
                    currentSubmission={currentSubmission}
                />

                <PrivateCommentSection
                    lessonId={lessonId}
                    existingComment={currentSubmission?.comment}
                />
            </div>
        </div>
    );
}
