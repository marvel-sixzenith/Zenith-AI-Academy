'use client';

import { ClipboardList, CheckSquare, FileText, Download } from 'lucide-react';

interface AssignmentViewProps {
    data: {
        description?: string;
        instructions?: string; // Legacy fallback
        checklist?: string[];
        attachment?: string;
    };
}

export default function AssignmentView({ data }: AssignmentViewProps) {
    const content = data.description || data.instructions || '';

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Assignment Instructions</h2>
                        <p className="text-sm text-[var(--text-muted)]">Read carefully and complete these steps</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none mb-8 text-[var(--text-secondary)]">
                    <p className="whitespace-pre-wrap leading-relaxed">
                        {content}
                    </p>
                </div>

                {data.checklist && data.checklist.length > 0 && (
                    <div className="bg-[var(--background-secondary)]/30 rounded-xl p-6 border border-[var(--border-color)]">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
                            Success Checklist
                        </h3>
                        <ul className="space-y-3">
                            {data.checklist.map((item, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 rounded border-[var(--border-color)] bg-[var(--background)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                    />
                                    <span className="text-[var(--text-secondary)]">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {data.attachment && (
                    <div className="mt-6">
                        <h3 className="font-bold mb-3 text-sm text-[var(--text-muted)] uppercase tracking-wider">
                            Attached Resource
                        </h3>
                        <a
                            href={data.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--background-secondary)]/30 hover:bg-[var(--background-secondary)] transition group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm">
                                    {data.attachment.split('/').pop()}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                                    Click to download material
                                </p>
                            </div>
                            <Download className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
                        </a>
                    </div>
                )}
            </div>

            <div className="p-4 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/10 text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                    When you are done, mark this lesson as <strong>Complete</strong> to proceed.
                </p>
            </div>
        </div>
    );
}
