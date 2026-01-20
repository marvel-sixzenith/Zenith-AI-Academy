'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Sparkles, Award, Target, CheckSquare, Type, AlignLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type QuestionType = 'MULTIPLE_CHOICE' | 'DROPDOWN' | 'CHECKBOXES' | 'SHORT_ANSWER' | 'PARAGRAPH';

interface Question {
    id: string;
    type?: QuestionType;
    question: string;
    text?: string;
    options?: string[];
    correctAnswer?: number | number[] | string;
}

interface QuizRunnerProps {
    data: {
        questions: Question[];
        passing_score: number;
    };
    onPass?: () => void;
    lessonId?: string;
    lessonTitle?: string;
    isPreviewMode?: boolean;
}

export default function QuizRunner({ data, onPass, lessonId, lessonTitle, isPreviewMode = false }: QuizRunnerProps) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // Answers state now needs to hold different types
    const [currentAnswer, setCurrentAnswer] = useState<any>(null);
    const [allAnswers, setAllAnswers] = useState<any[]>([]); // Array of user answers
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const questions = data?.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    // Ensure type defaults to MC if missing
    const currentType = currentQuestion?.type || 'MULTIPLE_CHOICE';

    if (!questions || questions.length === 0) {
        return (
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                <Target className="w-12 h-12 text-[var(--text-muted)] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Quiz Under Construction</h3>
                <p className="text-[var(--text-secondary)]">This quiz has no questions yet. Please check back later.</p>
            </div>
        );
    }

    const questionText = currentQuestion?.question || currentQuestion?.text || 'Question';
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

    // Reset current answer when question changes
    useEffect(() => {
        // Initialize default empty answer based on type
        if (currentType === 'CHECKBOXES') {
            setCurrentAnswer([]);
        } else if (currentType === 'SHORT_ANSWER' || currentType === 'PARAGRAPH') {
            setCurrentAnswer('');
        } else {
            setCurrentAnswer(null);
        }
    }, [currentQuestionIndex, currentType]);

    const handleOptionSelect = (index: number) => {
        if (isSubmitted || showFeedback) return;
        setCurrentAnswer(index);
    };

    const handleCheckboxConnect = (index: number) => {
        if (isSubmitted || showFeedback) return;
        const currentSelected = (currentAnswer as number[]) || [];
        if (currentSelected.includes(index)) {
            setCurrentAnswer(currentSelected.filter(i => i !== index));
        } else {
            setCurrentAnswer([...currentSelected, index].sort());
        }
    };

    const handleTextChange = (val: string) => {
        if (isSubmitted || showFeedback) return;
        setCurrentAnswer(val);
    };

    const handleNext = () => {
        // Validation before next
        if (currentType === 'CHECKBOXES' && (!currentAnswer || currentAnswer.length === 0)) return;
        if ((currentType === 'SHORT_ANSWER' || currentType === 'PARAGRAPH') && !currentAnswer?.trim()) return;
        if ((currentType === 'MULTIPLE_CHOICE' || currentType === 'DROPDOWN') && currentAnswer === null) return;

        const newAllAnswers = [...allAnswers];
        newAllAnswers[currentQuestionIndex] = currentAnswer;
        setAllAnswers(newAllAnswers);

        if (isLastQuestion) {
            calculateScore(newAllAnswers);
        } else {
            setShowFeedback(true);
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
                setShowFeedback(false);
            }, 300);
        }
    };

    const calculateScore = async (finalAnswers: any[]) => {
        let correctCount = 0;

        finalAnswers.forEach((userAns, index) => {
            const q = questions[index];
            if (!q) return; // Safety check

            const qType = q.type || 'MULTIPLE_CHOICE';
            const correctAns = q.correctAnswer;

            let isCorrect = false;

            if (qType === 'MULTIPLE_CHOICE' || qType === 'DROPDOWN') {
                isCorrect = userAns === correctAns;
            } else if (qType === 'CHECKBOXES') {
                // Compare arrays
                if (Array.isArray(correctAns) && Array.isArray(userAns)) {
                    const sortedCorrect = [...correctAns].sort().toString();
                    const sortedUser = [...userAns].sort().toString();
                    isCorrect = sortedCorrect === sortedUser;
                }
            } else if (qType === 'SHORT_ANSWER') {
                if (typeof correctAns === 'string' && typeof userAns === 'string') {
                    isCorrect = userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();
                }
            } else if (qType === 'PARAGRAPH') {
                // Logic: If user wrote something substantial (e.g. > 10 chars), mark correct
                // or just participation check
                if (typeof userAns === 'string') {
                    isCorrect = userAns.trim().length > 0;
                }
            }

            if (isCorrect) correctCount++;
        });

        const finalScore = (correctCount / questions.length) * 100;
        setScore(finalScore);
        setIsSubmitted(true);

        const passed = finalScore >= data.passing_score;

        if (passed) {
            onPass?.();
        }

        if (!isPreviewMode) {
            await saveProgress(finalScore, passed);
        }
    };

    const saveProgress = async (finalScore: number, isPassed: boolean) => {
        if (!lessonId) return;
        setIsCompleting(true);
        try {
            const res = await fetch(`/api/lessons/${lessonId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: finalScore,
                    isCompleted: isPassed
                }),
            });

            if (!res.ok) throw new Error('Failed to save progress');
            const result = await res.json();

            if (isPassed && result.pointsAwarded > 0) {
                toast.success(`Lesson "${lessonTitle || 'Lesson'}" Completed! +${result.pointsAwarded} XP`);
                router.refresh();
            } else if (isPassed) {
                toast.success(`Progress saved!`);
                router.refresh();
            } else {
                toast.success('Progress saved. Keep trying!');
            }

        } catch (error) {
            console.error('Completion error:', error);
            toast.error('Failed to save progress');
        } finally {
            setIsCompleting(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setCurrentAnswer(null);
        setAllAnswers([]);
        setIsSubmitted(false);
        setScore(0);
        setIsCompleting(false);
        setShowFeedback(false);
    };

    // --- RENDER HELPERS ---

    const renderInput = () => {
        if (!currentQuestion) return <div>Error: Question data missing</div>;
        const options = currentQuestion.options || [];

        switch (currentType) {
            case 'MULTIPLE_CHOICE':
                return (
                    <div className="space-y-3">
                        {Array.isArray(options) && options.map((option, index) => {
                            const isSelected = currentAnswer === index;
                            const optionLetter = String.fromCharCode(65 + index);
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    className={`w-full group relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected
                                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-lg shadow-[var(--primary)]/10 scale-[1.02]'
                                        : 'border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:bg-[var(--background-card)]'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200 ${isSelected
                                        ? 'bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white shadow-lg shadow-[var(--primary)]/25'
                                        : 'bg-[var(--background-secondary)] text-[var(--text-muted)] group-hover:bg-[var(--primary)]/20 group-hover:text-[var(--primary)]'
                                        }`}>
                                        {optionLetter}
                                    </div>
                                    <span className={`text-lg font-medium flex-1 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                                        {option}
                                    </span>
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                        ? 'border-[var(--primary)] bg-[var(--primary)]'
                                        : 'border-[var(--border-color)] group-hover:border-[var(--primary)]/50'
                                        }`}>
                                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                );

            case 'CHECKBOXES':
                return (
                    <div className="space-y-3">
                        {Array.isArray(options) && options.map((option, index) => {
                            const isSelected = (currentAnswer as number[])?.includes(index);
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleCheckboxConnect(index)}
                                    className={`w-full group relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected
                                        ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.01]'
                                        : 'border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:bg-[var(--background-card)]'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                                        : 'border-[var(--text-muted)] group-hover:border-[var(--primary)]'
                                        }`}>
                                        {isSelected && <CheckSquare className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-lg font-medium flex-1 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                                        {option}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                );

            case 'DROPDOWN':
                return (
                    <div className="mt-4">
                        <select
                            value={currentAnswer ?? ''}
                            onChange={(e) => handleOptionSelect(parseInt(e.target.value))}
                            className="w-full p-4 text-lg rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-all"
                        >
                            <option value="" disabled>Select an answer...</option>
                            {Array.isArray(options) && options.map((option, index) => (
                                <option key={index} value={index}>{option}</option>
                            ))}
                        </select>
                    </div>
                );

            case 'SHORT_ANSWER':
                return (
                    <div className="mt-4">
                        <input
                            type="text"
                            value={currentAnswer || ''}
                            onChange={(e) => handleTextChange(e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full p-5 text-lg rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-all"
                        />
                    </div>
                );

            case 'PARAGRAPH':
                return (
                    <div className="mt-4">
                        <textarea
                            value={currentAnswer || ''}
                            onChange={(e) => handleTextChange(e.target.value)}
                            placeholder="Type your detailed answer here..."
                            className="w-full p-5 text-lg rounded-xl bg-[var(--background-secondary)] border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-all min-h-[150px]"
                        />
                    </div>
                );

            default:
                return <div>Unknown question type</div>;
        }
    };

    const isNextDisabled = () => {
        if (currentType === 'CHECKBOXES') return !currentAnswer || (currentAnswer as number[]).length === 0;
        if (currentType === 'SHORT_ANSWER' || currentType === 'PARAGRAPH') return !currentAnswer?.trim();
        return currentAnswer === null;
    };

    // --- MAIN RENDER ---

    if (isSubmitted) {
        const passed = score >= data.passing_score;
        const correctAnswers = Math.round((score / 100) * questions.length);

        return (
            <div className="max-w-2xl mx-auto">
                {/* Results Card */}
                <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 text-center ${passed
                    ? 'bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border border-emerald-500/20'
                    : 'bg-gradient-to-br from-rose-500/10 via-red-500/5 to-pink-500/10 border border-rose-500/20'
                    }`}>
                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${passed ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`} />
                    <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl ${passed ? 'bg-teal-500/20' : 'bg-pink-500/20'}`} />

                    <div className={`relative w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center ${passed
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30'
                        : 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-500/30'
                        }`}>
                        {passed ? <Award className="w-14 h-14 text-white" /> : <Target className="w-14 h-14 text-white" />}
                    </div>

                    <h2 className="relative text-3xl md:text-4xl font-bold mb-2">
                        {passed ? 'Excellent Work!' : 'Keep Practicing!'}
                    </h2>
                    <p className="relative text-[var(--text-secondary)] mb-8">
                        {passed ? "You've demonstrated mastery of this topic." : "Review the material and try again."}
                    </p>

                    <div className="relative flex items-center justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className={`text-5xl font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {score.toFixed(0)}%
                            </div>
                            <div className="text-sm text-[var(--text-muted)] mt-1">Your Score</div>
                        </div>
                        <div className="w-px h-16 bg-[var(--border-color)]" />
                        <div className="text-center">
                            <div className="text-5xl font-bold text-[var(--text-secondary)]">
                                {correctAnswers}/{questions.length}
                            </div>
                            <div className="text-sm text-[var(--text-muted)] mt-1">Correct</div>
                        </div>
                    </div>

                    {isCompleting && (
                        <div className="flex items-center justify-center gap-2 mb-4 animate-pulse">
                            <Sparkles className="w-5 h-5" />
                            <span>Saving your progress...</span>
                        </div>
                    )}

                    {passed ? (
                        <div className="relative space-y-3">
                            {isPreviewMode ? (
                                <p className="text-amber-400 flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Preview mode - progress not saved
                                </p>
                            ) : !isCompleting && (
                                <p className="text-emerald-400 flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Progress saved! Ready for the next lesson.
                                </p>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={resetQuiz}
                            disabled={isCompleting}
                            className={`relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:scale-105 transition-all duration-300 ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <RotateCcw className="w-5 h-5" />
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white font-bold text-lg shadow-lg shadow-[var(--primary)]/25">
                            {currentQuestionIndex + 1}
                        </div>
                        <div>
                            <div className="text-sm text-[var(--text-muted)]">Question</div>
                            <div className="font-semibold text-[var(--text-primary)]">
                                {currentQuestionIndex + 1} of {questions.length}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-[var(--text-muted)]">Progress</div>
                        <div className="font-semibold text-[var(--primary)]">{Math.round(progressPercent)}%</div>
                    </div>
                </div>
                <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className={`relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-card)] transition-all duration-300 ${showFeedback ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] via-blue-500 to-purple-500" />

                <div className="p-8 md:p-10">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[var(--primary)] tracking-wider uppercase">
                            {currentType.replace('_', ' ')}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight text-[var(--text-primary)]">
                            {questionText}
                        </h2>
                    </div>

                    {renderInput()}

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-color)]">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            {currentType === 'MULTIPLE_CHOICE' ? (
                                <>
                                    <kbd className="px-2 py-1 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] font-mono text-xs">
                                        1-{currentQuestion?.options?.length}
                                    </kbd>
                                    <span>to select</span>
                                </>
                            ) : null}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={isNextDisabled()}
                            className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${!isNextDisabled()
                                ? 'bg-gradient-to-r from-[var(--primary)] to-blue-600 shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:scale-105 active:scale-95'
                                : 'bg-[var(--text-muted)]/30 cursor-not-allowed'
                                }`}
                        >
                            {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
