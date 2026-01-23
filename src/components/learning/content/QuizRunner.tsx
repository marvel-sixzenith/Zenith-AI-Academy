'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, RotateCcw, Sparkles, Award, Target, CheckSquare, Type, AlignLeft } from 'lucide-react';
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

interface QuizSettings {
    passingScore?: number;
    showScoreImmediate?: boolean;
    shuffleQuestions?: boolean;
    requireAll?: boolean;
    allowRetries?: boolean;
    maxRetries?: number;
}

interface QuizRunnerProps {
    data: {
        questions: Question[];
        passing_score?: number;
        settings?: QuizSettings;
    };
    onPass?: () => void;
    lessonId?: string;
    lessonTitle?: string;
    isPreviewMode?: boolean;
    initialScore?: number;
    isCompleted?: boolean;
}

export default function QuizRunner({
    data,
    onPass,
    lessonId,
    lessonTitle,
    isPreviewMode = false,
    initialScore,
    isCompleted: initialCompleted = false
}: QuizRunnerProps) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState<any>(null);
    const [allAnswers, setAllAnswers] = useState<any[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(initialCompleted);
    const [score, setScore] = useState(initialScore || 0);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    // Settings with defaults
    const settings = {
        passingScore: data.settings?.passingScore ?? data.passing_score ?? 70,
        showScoreImmediate: data.settings?.showScoreImmediate ?? true,
        shuffleQuestions: data.settings?.shuffleQuestions ?? false,
        requireAll: data.settings?.requireAll ?? true,
        allowRetries: data.settings?.allowRetries ?? true,
        maxRetries: data.settings?.maxRetries ?? 3
    };

    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(data?.questions || []);
    const [retryCount, setRetryCount] = useState(0);

    // Initialize Questions (Shuffle if needed)
    useEffect(() => {
        let q = [...(data?.questions || [])];
        if (settings.shuffleQuestions && !isSubmitted) {
            // Simple Fisher-Yates shuffle
            for (let i = q.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [q[i], q[j]] = [q[j], q[i]];
            }
        }
        setShuffledQuestions(q);
    }, [data, settings.shuffleQuestions, isSubmitted]);

    // Restore answer when navigating (back or forward)
    useEffect(() => {
        const storedAnswer = allAnswers[currentQuestionIndex];
        if (storedAnswer !== undefined) {
            setCurrentAnswer(storedAnswer);
        } else {
            // Initialize default if not visited
            if (currentType === 'CHECKBOXES') {
                setCurrentAnswer([]);
            } else if (currentType === 'SHORT_ANSWER' || currentType === 'PARAGRAPH') {
                setCurrentAnswer('');
            } else {
                setCurrentAnswer(null);
            }
        }
    }, [currentQuestionIndex]); // Removed currentType dependence to avoid reset

    const questions = shuffledQuestions;
    const currentQuestion = questions[currentQuestionIndex];

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

    // Reset logic moved to new useEffect handling navigation


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
        // Validation check
        const isAnswered = () => {
            if (currentType === 'CHECKBOXES') return currentAnswer && (Array.isArray(currentAnswer) && currentAnswer.length > 0);
            if (currentType === 'SHORT_ANSWER' || currentType === 'PARAGRAPH') return typeof currentAnswer === 'string' && currentAnswer.trim().length > 0;
            return currentAnswer !== null;
        };

        if (settings.requireAll && !isAnswered()) {
            toast.error("Please answer this question to proceed.");
            return;
        }

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

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            // Save current answer before going back (optional, but good UX)
            const newAllAnswers = [...allAnswers];
            newAllAnswers[currentQuestionIndex] = currentAnswer;
            setAllAnswers(newAllAnswers);

            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const calculateScore = async (finalAnswers: any[]) => {
        let correctCount = 0;

        finalAnswers.forEach((userAns, index) => {
            const q = questions[index];
            if (!q) return; // Safety check

            const qType = q.type || 'MULTIPLE_CHOICE';
            const correctAns = q.correctAnswer;

            // Optional Answer Logic: If no correct answer is defined, mark as correct (Participation)
            if (correctAns === undefined || correctAns === null || correctAns === '') {
                correctCount++;
                return;
            }

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
            } else if (qType === 'SHORT_ANSWER' || qType === 'PARAGRAPH') {
                // Modified logic: As long as the user answers, it's correct (Participation based)
                if (typeof userAns === 'string') {
                    isCorrect = userAns.trim().length > 0;
                }
            }

            if (isCorrect) correctCount++;
        });

        const finalScore = (correctCount / questions.length) * 100;
        setScore(finalScore);
        setIsSubmitted(true);

        const passed = finalScore >= settings.passingScore;

        if (passed) {
            onPass?.();
        }

        if (!isPreviewMode) {
            await saveProgress(finalScore, passed, finalAnswers);
        }
    };

    const saveProgress = async (finalScore: number, isPassed: boolean, finalAnswers?: any[]) => {
        if (!lessonId) return;
        setIsCompleting(true);
        try {
            // Use the provided finalAnswers or fall back to state (though state might be stale if called immediately)
            const answersToSave = finalAnswers || allAnswers;

            // Use the dedicated quiz submission API to save answers!
            // Format answers for API
            // The API expects: { lessonId, score, totalQuestions, answers: [] }
            // Answers format: { questionId, questionText, selectedOption, isCorrect }

            const formattedAnswers = answersToSave.map((ans, idx) => {
                const q = questions[idx];
                const qType = q.type || 'MULTIPLE_CHOICE';
                const correctAns = q.correctAnswer;

                let isCorrect = false;
                if (qType === 'MULTIPLE_CHOICE' || qType === 'DROPDOWN') {
                    isCorrect = ans === correctAns;
                } else if (qType === 'CHECKBOXES') {
                    if (Array.isArray(correctAns) && Array.isArray(ans)) {
                        const sortedCorrect = [...correctAns].sort().toString();
                        const sortedUser = [...ans].sort().toString();
                        isCorrect = sortedCorrect === sortedUser;
                    }
                } else if (qType === 'SHORT_ANSWER' || qType === 'PARAGRAPH') {
                    if (typeof ans === 'string') isCorrect = ans.trim().length > 0;
                }

                // Determine selected option label or value
                let selectedOptionStr = '';
                if (qType === 'MULTIPLE_CHOICE' || qType === 'DROPDOWN') {
                    selectedOptionStr = (q.options && ans !== null && ans !== undefined) ? q.options[ans] : String(ans ?? '');
                } else if (qType === 'CHECKBOXES' && Array.isArray(ans) && q.options) {
                    selectedOptionStr = ans.map((idx: number) => q.options![idx]).join(', ');
                } else {
                    selectedOptionStr = String(ans ?? '');
                }

                return {
                    questionId: q.id,
                    questionText: q.question || q.text || 'Question',
                    selectedOption: selectedOptionStr,
                    isCorrect
                };
            });

            const res = await fetch(`/api/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    score: finalScore,
                    totalQuestions: questions.length,
                    answers: formattedAnswers
                }),
            });

            if (!res.ok) throw new Error('Failed to save progress');

            // The result from this API might differ slightly, let's just handle success
            // Note: The API currently returns the submission object. 
            // We assume it handles point checking internally (it mentions it in comments but might not award points yet if we don't impl logic)
            // Wait, the API I viewed earlier (api/quiz/submit/route.ts) DOES NOT award points yet (commented out).
            // BUT, user-progress logic is there.
            // I should ALSO call the progress API if I want to ensure points are awarded? 
            // OR I should update the quiz API to award points. 

            // Let's stick to just this call first, but I need to ensure points are awarded!
            // The previous code verified points were awarded by `progress` API.
            // I should chain them OR update the `api/quiz/submit` to award points.
            // PROCEEDING STRATEGY: Update `api/quiz/submit` to award points first to be safe, 
            // OR call both. Calling both is safer for now without touching backend logic I can't easily verify transactionally.
            // user marks as COMPLETED in both.
            // Let's call the `progress` API *after* submission to ensure POINTS are awarded correctly as implemented there.

            await fetch(`/api/lessons/${lessonId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: finalScore,
                    isCompleted: isPassed
                }),
            });

            // We can assume success if we got here
            if (isPassed) {
                toast.success(`Quiz Completed!`);
                router.refresh();
            } else {
                toast.success('Progress saved.');
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
                            const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(index);
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
        if (!settings.requireAll) return false;

        if (currentType === 'CHECKBOXES') return !currentAnswer || (currentAnswer as number[]).length === 0;
        if (currentType === 'SHORT_ANSWER' || currentType === 'PARAGRAPH') {
            return typeof currentAnswer !== 'string' || !currentAnswer.trim();
        }
        return currentAnswer === null;
    };

    // --- MAIN RENDER ---

    if (isSubmitted) {
        // Use settings.passingScore which has a default of 70
        const passed = score >= settings.passingScore;
        const correctAnswers = Math.round((score / 100) * questions.length);

        return (
            <div className="max-w-2xl mx-auto">
                <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 text-center border ${passed
                    ? 'bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border-emerald-500/20'
                    : 'bg-gradient-to-br from-rose-500/10 via-red-500/5 to-pink-500/10 border-rose-500/20'}`}>

                    <div className={`active w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${passed
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-rose-500/20 text-rose-500'}`}>
                        {passed ? <Award className="w-12 h-12" /> : <Target className="w-12 h-12" />}
                    </div>

                    <h2 className="text-3xl font-bold mb-4">{passed ? 'Quiz Completed!' : 'Quiz Submitted'}</h2>

                    {settings.showScoreImmediate ? (
                        <>
                            <div className="text-5xl font-bold mb-2">{score.toFixed(0)}%</div>
                            <p className="text-[var(--text-muted)] mb-8">
                                {passed ? 'Great job! You have passed.' : `You need ${settings.passingScore}% to pass.`}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/50">
                                    <div className="text-2xl font-bold text-[var(--text-primary)]">{correctAnswers}</div>
                                    <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Correct</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-[var(--background-secondary)]/50">
                                    <div className="text-2xl font-bold text-[var(--text-primary)]">{questions.length}</div>
                                    <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Total</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-[var(--text-secondary)] mb-8">
                            Your answers have been submitted for review.
                        </p>
                    )}

                    {isCompleting && (
                        <div className="flex items-center justify-center gap-2 mb-6 animate-pulse text-[var(--primary)]">
                            <Sparkles className="w-4 h-4" />
                            <span>Saving results...</span>
                        </div>
                    )}

                    <div className="flex justify-center gap-4">
                        {(settings.allowRetries && (retryCount < settings.maxRetries || settings.maxRetries === 0)) && !passed && (
                            <button
                                onClick={() => {
                                    resetQuiz();
                                    setRetryCount(prev => prev + 1);
                                }}
                                disabled={isCompleting}
                                className="btn-primary"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Try Again ({settings.maxRetries - retryCount} left)
                            </button>
                        )}

                        {(passed || (!settings.allowRetries || retryCount >= settings.maxRetries)) && (
                            <button
                                onClick={() => router.push(`/lessons/${lessonId}/next`)}
                                className="btn-secondary"
                            >
                                Continue
                            </button>
                        )}
                    </div>
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
                        <div className="flex items-center gap-4">
                            {currentQuestionIndex > 0 && (
                                <button
                                    onClick={handlePrevious}
                                    className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--background-card)] hover:text-[var(--text-primary)] transition-all duration-200"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Previous
                                </button>
                            )}

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
