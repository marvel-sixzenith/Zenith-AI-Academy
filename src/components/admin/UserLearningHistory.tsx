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
        contentData?: string;
    };
    status: string;
    updatedAt: Date;
    quizSubmission?: {
        score: number;
        totalQuestions: number;
        answers: {
            questionId?: string;
            questionText: string;
            selectedOption: string;
            isCorrect: boolean;
        }[];
    } | null;
    assignmentSubmission?: {
        fileUrl?: string; // Optional legacy
        fileName?: string; // Optional legacy
        files?: string;   // New JSON string
        link?: string;
        comment?: string;
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
                                        {(() => {
                                            const submittedAnswers = selectedItem.quizSubmission?.answers || [];

                                            // Parse contentData to get full list of questions
                                            let questions: any[] = [];
                                            try {
                                                if (selectedItem.lesson.contentData) {
                                                    const data = JSON.parse(selectedItem.lesson.contentData);
                                                    if (data && data.questions && Array.isArray(data.questions)) {
                                                        questions = data.questions;
                                                    }
                                                }
                                            } catch (e) {
                                                console.error("Failed to parse lesson contentData", e);
                                            }

                                            console.log("DEBUG QUIZ DISPLAY:", {
                                                quizScore: selectedItem.quizSubmission?.score,
                                                questionsFromContent: questions.map(q => ({ id: q.id, text: q.question || q.text })),
                                                submittedAnswers: submittedAnswers.map(a => ({ qId: a.questionId, text: a.questionText, selected: a.selectedOption })),
                                                rawSubmission: selectedItem.quizSubmission
                                            });

                                            // If we have questions from contentData, use them as the source of truth
                                            if (questions.length > 0) {
                                                return questions.map((q, idx) => {
                                                    // Find matching answer by questionId first, then by index position
                                                    let answer = submittedAnswers.find(a => a.questionId && q.id && a.questionId === q.id);

                                                    // Fallback: use index-based matching (answers submitted in order)
                                                    if (!answer && submittedAnswers[idx]) {
                                                        answer = submittedAnswers[idx];
                                                    }

                                                    const isAnswered = !!answer;
                                                    const isCorrect = answer?.isCorrect || false;
                                                    const selectedOption = answer?.selectedOption;
                                                    const questionText = q.question || q.text || answer?.questionText || `Question ${idx + 1}`;

                                                    // Handle "Empty" case display
                                                    const displaySelected = !selectedOption || selectedOption === '' || selectedOption === 'EMPTY'
                                                        ? <span className="text-[var(--text-muted)] italic">No answer provided</span>
                                                        : <strong className={isCorrect ? 'text-green-500' : 'text-red-500'}>{selectedOption}</strong>;

                                                    return (
                                                        <div key={idx} className={`p-4 rounded-xl border ${isAnswered && selectedOption ? (isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5') : 'border-[var(--border-color)] bg-[var(--background-secondary)]/10'}`}>
                                                            <p className="font-medium mb-2">{idx + 1}. {questionText}</p>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-[var(--text-secondary)]">
                                                                    Selected: {displaySelected}
                                                                </span>
                                                                {isAnswered && selectedOption ? (
                                                                    isCorrect ? (
                                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                                    ) : (
                                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                                    )
                                                                ) : (
                                                                    <span className="text-xs px-2 py-1 bg-[var(--background-secondary)] text-[var(--text-muted)] rounded">Skipped/Missing</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            } else if (submittedAnswers.length > 0) {
                                                // Fallback to answers array directly if no contentData
                                                return submittedAnswers.map((answer, idx) => (
                                                    <div key={idx} className={`p-4 rounded-xl border ${answer.isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                                        <p className="font-medium mb-2">{idx + 1}. {answer.questionText}</p>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-[var(--text-secondary)]">
                                                                Selected: <strong className={answer.isCorrect ? 'text-green-500' : 'text-red-500'}>{answer.selectedOption || 'N/A'}</strong>
                                                            </span>
                                                            {answer.isCorrect ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ));
                                            } else {
                                                return <p className="text-center text-[var(--text-muted)] py-4">No answer details available.</p>;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {selectedItem.assignmentSubmission && (
                                <div className="text-center py-6 space-y-6">
                                    {/* Files Section */}
                                    {(() => {
                                        let files: { name: string; url: string }[] = [];
                                        try {
                                            // Try new files JSON first
                                            if (selectedItem.assignmentSubmission.files) {
                                                files = JSON.parse(selectedItem.assignmentSubmission.files);
                                            }
                                            // Fallback to legacy single file
                                            else if (selectedItem.assignmentSubmission.fileUrl) {
                                                files = [{
                                                    name: selectedItem.assignmentSubmission.fileName || 'Assignment File',
                                                    url: selectedItem.assignmentSubmission.fileUrl
                                                }];
                                            }
                                        } catch (e) {
                                            console.error("Failed to parse files JSON", e);
                                        }

                                        return files.map((file, idx) => (
                                            <div key={idx} className="bg-[var(--background-secondary)]/30 rounded-xl p-4 flex items-center justify-between group hover:bg-[var(--background-secondary)]/50 transition">
                                                <div className="flex items-center gap-3 min-w-0 text-left">
                                                    <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center text-[var(--primary)] shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">Attachment</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] text-[var(--text-muted)] transition"
                                                    title="View/Download"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                            </div>
                                        ));
                                    })()}

                                    {/* Link Section */}
                                    {selectedItem.assignmentSubmission.link && (
                                        <div className="bg-[var(--background-secondary)]/30 rounded-xl p-4 flex items-center justify-between group hover:bg-[var(--background-secondary)]/50 transition">
                                            <div className="flex items-center gap-3 min-w-0 text-left">
                                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                                                    <Eye className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate max-w-[200px]">{selectedItem.assignmentSubmission.link}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">External Link</p>
                                                </div>
                                            </div>
                                            <a
                                                href={selectedItem.assignmentSubmission.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 text-[var(--text-muted)] transition"
                                                title="Open Link"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </a>
                                        </div>
                                    )}

                                    {/* Comment Section */}
                                    {selectedItem.assignmentSubmission.comment && (
                                        <div className="bg-[var(--background-secondary)]/30 rounded-xl p-4 text-left">
                                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Private Comment</p>
                                            <p className="text-sm italic text-[var(--text-secondary)]">"{selectedItem.assignmentSubmission.comment}"</p>
                                        </div>
                                    )}

                                    <p className="text-[var(--text-muted)] text-sm pt-4 border-t border-[var(--border-color)]">
                                        Submitted on {new Date(selectedItem.assignmentSubmission.submittedAt).toLocaleString()}
                                    </p>
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
