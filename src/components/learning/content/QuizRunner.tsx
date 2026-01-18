'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Sparkles, Award, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Question {
    id: string;
    question: string;
    text?: string; // fallback for different data structures
    options: string[];
    correctAnswer: number;
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
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const currentQuestion = data.questions[currentQuestionIndex];
    const questionText = currentQuestion?.question || currentQuestion?.text || 'Question';
    const isLastQuestion = currentQuestionIndex === data.questions.length - 1;
    const progressPercent = ((currentQuestionIndex + 1) / data.questions.length) * 100;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSubmitted || showFeedback) return;

            const key = parseInt(e.key);
            if (!isNaN(key) && key >= 1 && key <= currentQuestion.options.length) {
                handleOptionSelect(key - 1);
            }

            if (e.key === 'Enter' && selectedOption !== null) {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestion, selectedOption, isSubmitted, showFeedback]);

    const handleOptionSelect = (index: number) => {
        if (isSubmitted || showFeedback) return;
        setSelectedOption(index);
    };

    const handleNext = () => {
        if (selectedOption === null) return;

        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = selectedOption;
        setAnswers(newAnswers);

        if (isLastQuestion) {
            calculateScore(newAnswers);
        } else {
            // Brief feedback animation before moving to next
            setShowFeedback(true);
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setShowFeedback(false);
            }, 300);
        }
    };

    const calculateScore = async (finalAnswers: number[]) => {
        let correctCount = 0;
        finalAnswers.forEach((answer, index) => {
            if (answer === data.questions[index].correctAnswer) {
                correctCount++;
            }
        });

        const finalScore = (correctCount / data.questions.length) * 100;
        setScore(finalScore);
        setIsSubmitted(true);

        if (finalScore >= data.passing_score) {
            onPass?.();
            // Only save progress if NOT in preview mode
            if (!isPreviewMode) {
                await markLessonAsComplete();
            }
        }
    };

    const markLessonAsComplete = async () => {
        if (!lessonId) return;
        setIsCompleting(true);
        try {
            const res = await fetch('/api/lessons/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId }),
            });

            if (!res.ok) throw new Error('Failed to mark complete');

            toast.success(`Lesson "${lessonTitle || 'Lesson'}" Completed!`);
            router.refresh();
        } catch (error) {
            console.error('Completion error:', error);
            toast.error('Failed to save progress');
        } finally {
            setIsCompleting(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setAnswers([]);
        setIsSubmitted(false);
        setScore(0);
        setIsCompleting(false);
        setShowFeedback(false);
    };

    // Results Screen
    if (isSubmitted) {
        const passed = score >= data.passing_score;
        const correctAnswers = Math.round((score / 100) * data.questions.length);

        return (
            <div className="max-w-2xl mx-auto">
                {/* Results Card */}
                <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 text-center ${passed
                    ? 'bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border border-emerald-500/20'
                    : 'bg-gradient-to-br from-rose-500/10 via-red-500/5 to-pink-500/10 border border-rose-500/20'
                    }`}>
                    {/* Decorative Elements */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${passed ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`} />
                    <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl ${passed ? 'bg-teal-500/20' : 'bg-pink-500/20'}`} />

                    {/* Icon */}
                    <div className={`relative w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center ${passed
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30'
                        : 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-500/30'
                        }`}>
                        {passed ? (
                            <Award className="w-14 h-14 text-white" />
                        ) : (
                            <Target className="w-14 h-14 text-white" />
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="relative text-3xl md:text-4xl font-bold mb-2">
                        {passed ? 'Excellent Work!' : 'Keep Practicing!'}
                    </h2>
                    <p className="relative text-[var(--text-secondary)] mb-8">
                        {passed
                            ? "You've demonstrated mastery of this topic."
                            : "Review the material and try again."}
                    </p>

                    {/* Score Display */}
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
                                {correctAnswers}/{data.questions.length}
                            </div>
                            <div className="text-sm text-[var(--text-muted)] mt-1">Correct</div>
                        </div>
                    </div>

                    {/* Action */}
                    {passed ? (
                        <div className="relative space-y-3">
                            {isCompleting ? (
                                <div className="flex items-center justify-center gap-2 text-emerald-400">
                                    <Sparkles className="w-5 h-5 animate-pulse" />
                                    <span>Saving your progress...</span>
                                </div>
                            ) : (
                                <p className="text-emerald-400 flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Progress saved! Ready for the next lesson.
                                </p>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={resetQuiz}
                            className="relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:scale-105 transition-all duration-300"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Quiz Question Screen
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
                                {currentQuestionIndex + 1} of {data.questions.length}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-[var(--text-muted)]">Progress</div>
                        <div className="font-semibold text-[var(--primary)]">{Math.round(progressPercent)}%</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className={`relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-card)] transition-all duration-300 ${showFeedback ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] via-blue-500 to-purple-500" />

                <div className="p-8 md:p-10">
                    {/* Question Text */}
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight text-[var(--text-primary)]">
                            {questionText}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    className={`w-full group relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected
                                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-lg shadow-[var(--primary)]/10 scale-[1.02]'
                                        : 'border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:bg-[var(--background-card)]'
                                        }`}
                                >
                                    {/* Option Letter Badge */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200 ${isSelected
                                        ? 'bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white shadow-lg shadow-[var(--primary)]/25'
                                        : 'bg-[var(--background-secondary)] text-[var(--text-muted)] group-hover:bg-[var(--primary)]/20 group-hover:text-[var(--primary)]'
                                        }`}>
                                        {optionLetter}
                                    </div>

                                    {/* Option Text */}
                                    <span className={`text-lg font-medium flex-1 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
                                        }`}>
                                        {option}
                                    </span>

                                    {/* Selection Indicator */}
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                        ? 'border-[var(--primary)] bg-[var(--primary)]'
                                        : 'border-[var(--border-color)] group-hover:border-[var(--primary)]/50'
                                        }`}>
                                        {isSelected && (
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-color)]">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <kbd className="px-2 py-1 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] font-mono text-xs">
                                1-{currentQuestion.options.length}
                            </kbd>
                            <span>to select</span>
                            <span className="mx-2">•</span>
                            <kbd className="px-2 py-1 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] font-mono text-xs">
                                Enter
                            </kbd>
                            <span>to continue</span>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={selectedOption === null}
                            className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${selectedOption !== null
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
