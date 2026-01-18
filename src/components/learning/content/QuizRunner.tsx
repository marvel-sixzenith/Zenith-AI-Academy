import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, RotateCcw, HelpCircle } from 'lucide-react';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // 0-indexed
}

interface QuizRunnerProps {
    data: {
        questions: Question[];
        passing_score: number;
    };
    onPass?: () => void;
}

export default function QuizRunner({ data, onPass }: QuizRunnerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<number[]>([]); // Store selected indices
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = data.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === data.questions.length - 1;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSubmitted) return;

            // Number keys 1-9
            const key = parseInt(e.key);
            if (!isNaN(key) && key >= 1 && key <= currentQuestion.options.length) {
                handleOptionSelect(key - 1);
            }

            // Enter key to proceed if option selected
            if (e.key === 'Enter' && selectedOption !== null) {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestion, selectedOption, isSubmitted]);

    const handleOptionSelect = (index: number) => {
        if (isSubmitted) return;
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
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
        }
    };

    const calculateScore = (finalAnswers: number[]) => {
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
        }
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setAnswers([]);
        setIsSubmitted(false);
        setScore(0);
    };

    if (isSubmitted) {
        const passed = score >= data.passing_score;
        return (
            <div className="glass-card p-10 text-center animate-fade-in max-w-2xl mx-auto">
                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 ring-8 ${passed ? 'bg-green-100 text-green-600 ring-green-50' : 'bg-red-100 text-red-600 ring-red-50'
                    }`}>
                    {passed ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                </div>

                <h2 className="text-4xl font-bold mb-3">{passed ? 'Quiz Passed!' : 'Needs Improvement'}</h2>
                <p className="text-lg text-[var(--text-secondary)] mb-8">
                    You scored <strong className={passed ? 'text-green-600' : 'text-red-600'}>{score.toFixed(0)}%</strong>
                    <span className="mx-2">•</span>
                    Passing score: {data.passing_score}%
                </p>

                {passed ? (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-8 text-green-800">
                        <p className="font-medium">
                            Great job! You've mastered this topic. You can now proceed to the next lesson.
                        </p>
                    </div>
                ) : (
                    <button onClick={resetQuiz} className="btn-primary w-full sm:w-auto mx-auto flex items-center justify-center gap-2 h-12 px-8 text-lg">
                        <RotateCcw className="w-5 h-5" />
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header / Progress */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--background-secondary)] font-mono text-sm font-bold border border-[var(--border-color)]">
                        {currentQuestionIndex + 1}
                    </span>
                    <span className="text-sm font-medium text-[var(--text-muted)]">/ {data.questions.length} Questions</span>
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)] bg-[var(--background-secondary)] px-3 py-1 rounded-full">
                    Press <span className="font-bold border border-[var(--border-color)] px-1 rounded mx-0.5">1</span>-<span className="font-bold border border-[var(--border-color)] px-1 rounded mx-0.5">{currentQuestion.options.length}</span> to select
                </div>
            </div>

            <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                {/* Progress Bar Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--background-secondary)]">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestionIndex) / data.questions.length) * 100}%` }}
                    />
                </div>

                {/* Question */}
                <div className="mb-10 mt-2">
                    <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
                        {currentQuestion.question}
                    </h3>
                    <p className="text-[var(--text-muted)] text-sm flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        Select the best answer from the options below
                    </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-10">
                    {currentQuestion.options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            className={`group relative p-5 pl-14 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedOption === index
                                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm scale-[1.01]'
                                    : 'border-[var(--border-color)] hover:border-[var(--primary)]/30 hover:bg-[var(--background-secondary)]'
                                }`}
                        >
                            {/* Key Hint Badge */}
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border flex items-center justify-center text-sm font-bold transition-colors ${selectedOption === index
                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                    : 'bg-white text-[var(--text-muted)] border-[var(--border-color)] group-hover:border-[var(--primary)]/50'
                                }`}>
                                {index + 1}
                            </div>

                            <span className={`text-lg font-medium ${selectedOption === index ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                                {option}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
                    <span className="text-sm text-[var(--text-muted)] hidden sm:inline-block">
                        Press <kbd className="font-sans px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--background-secondary)] text-xs">Enter</kbd> to continue
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={selectedOption === null}
                        className="btn-primary h-12 px-8 text-base flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                    >
                        {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
