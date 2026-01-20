"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, CheckCircle, XCircle, FileText, Download, X } from 'lucide-react';

interface LearningHistoryItem {
    id: string;
    lesson: {
        id: string;
        title: string;
        pointsValue: number;
        contentType: string;
    };
    status: string;
    updatedAt: Date;
    quizSubmission?: {
        score: number;
        totalQuestions: number;
        answers: {
            questionText: string;
            selectedOption: string;
            isCorrect: boolean;
        }[];
    } | null;
    assignmentSubmission?: {
        fileUrl: string;
        fileName: string;
        submittedAt: Date;
    } | null;
}

interface UserLearningHistoryProps {
    history: LearningHistoryItem[];
}

export default function UserLearningHistory({ history }: UserLearningHistoryProps) {
    const [selectedItem, setSelectedItem] = useState<LearningHistoryItem | null>(null);

    const closeModal = () => setSelectedItem(null);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date));
    };

    return (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Learning History</h3>

            <div className="space-y-4">
                {history.length > 0 ? history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-[var(--background-secondary)]/30 rounded-xl">
                        <div>
                            <p className="font-medium mr-2">{item.lesson.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {item.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                                </span>
                                <span className="text-xs text-[var(--text-muted)]">
                                    {formatDate(item.updatedAt)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {item.status === 'COMPLETED' && (
                                <span className="text-xs font-bold px-2 py-1 bg-green-500/10 text-green-500 rounded-lg hidden sm:inline-block">
                                    +{item.lesson.pointsValue} pts
                                </span>
                            )}

                            {/* View Details Button for Quiz/Assignment */}
                            {(item.quizSubmission || item.assignmentSubmission) && (
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition"
                                    title="View Submission Details"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <p className="text-[var(--text-muted)] text-center py-8">No learning activity yet.</p>
                )}
            </div>

            {/* Modal */}
            {selectedItem && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={closeModal} />

                    <div
                        className="relative bg-[#0f172a] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-slide-up z-10"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[#0f172a]">
                            <div>
                                <h3 className="text-xl font-bold">{selectedItem.lesson.title}</h3>
                                <p className="text-sm text-[var(--text-muted)]">Submission Details</p>
                            </div>
                            <button onClick={closeModal} className="p-2 rounded-full hover:bg-[var(--background-secondary)] transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-[#0f172a]">
                            {selectedItem.quizSubmission && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 rounded-xl bg-[var(--background-secondary)] text-center min-w-[100px]">
                                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Score</p>
                                            <p className="text-3xl font-bold text-[var(--primary)]">
                                                {selectedItem.quizSubmission.score}
                                                <span className="text-base text-[var(--text-muted)] font-normal">/{selectedItem.quizSubmission.totalQuestions}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {selectedItem.quizSubmission.answers && selectedItem.quizSubmission.answers.length > 0 ? (
                                            selectedItem.quizSubmission.answers.map((answer, idx) => (
                                                <div key={idx} className={`p-4 rounded-xl border ${answer.isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                                    <p className="font-medium mb-2">{idx + 1}. {answer.questionText}</p>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-[var(--text-secondary)]">
                                                            Selected: <strong className={answer.isCorrect ? 'text-green-500' : 'text-red-500'}>{answer.selectedOption}</strong>
                                                        </span>
                                                        {answer.isCorrect ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-[var(--text-muted)] py-4">No answer details available.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedItem.assignmentSubmission && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--primary)]">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-lg font-bold mb-2 break-all">{selectedItem.assignmentSubmission.fileName}</h4>
                                    <p className="text-[var(--text-muted)] mb-6">
                                        Submitted on {new Date(selectedItem.assignmentSubmission.submittedAt).toLocaleString()}
                                    </p>

                                    <a
                                        href={selectedItem.assignmentSubmission.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary inline-flex items-center gap-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
