'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, RotateCcw } from 'lucide-react';

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
            <div className="glass-card p-8 text-center animate-fade-in">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${passed ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--error)]/10 text-[var(--error)]'
                    }`}>
                    {passed ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                </div>

                <h2 className="text-3xl font-bold mb-2">{passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
                <p className="text-[var(--text-secondary)] mb-8">
                    You scored <strong className={passed ? 'text-[var(--success)]' : 'text-[var(--error)]'}>{score.toFixed(0)}%</strong>
                    <br />
                    Passing score: {data.passing_score}%
                </p>

                {passed ? (
                    <p className="text-[var(--success)] font-medium">
                        Great job! You can strictly move to the next lesson now.
                    </p>
                ) : (
                    <button onClick={resetQuiz} className="btn-primary mx-auto flex items-center gap-2">
                        <RotateCcw className="w-5 h-5" />
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="glass-card p-6 md:p-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
                    <span>Question {currentQuestionIndex + 1} of {data.questions.length}</span>
                    <span>{Math.round(((currentQuestionIndex) / data.questions.length) * 100)}% completed</span>
                </div>
                <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex) / data.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <h3 className="text-xl font-bold mb-6 leading-relaxed">
                {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => (
                    <div
                        key={index}
                        onClick={() => handleOptionSelect(index)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${selectedOption === index
                                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                                : 'border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:bg-[var(--background-secondary)]'
                            }`}
                    >
                        <span className={`font-medium ${selectedOption === index ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                            {option}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === index ? 'border-[var(--primary)]' : 'border-[var(--text-muted)] group-hover:border-[var(--primary)]/50'
                            }`}>
                            {selectedOption === index && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={selectedOption === null}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
