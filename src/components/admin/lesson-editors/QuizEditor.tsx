'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index of correct option
}

interface QuizEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function QuizEditor({ value, onChange }: QuizEditorProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const onChangeRef = useRef(onChange);
    const isInitializedRef = useRef(false);
    const hasLoadedRef = useRef(false);

    // Keep ref updated
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Parse initial value only once when value changes AND we haven't loaded yet
    useEffect(() => {
        if (hasLoadedRef.current) return;

        try {
            const parsed = JSON.parse(value);
            if (parsed.type === 'quiz' && Array.isArray(parsed.questions)) {
                setQuestions(parsed.questions);
                hasLoadedRef.current = true;
                isInitializedRef.current = true;
            }
        } catch {
            // Ignore parse errors, start empty
            isInitializedRef.current = true;
        }
    }, [value]);

    // Update parent whenever questions change (but NOT on initial load)
    useEffect(() => {
        if (!isInitializedRef.current) return;

        const quizData = {
            type: 'quiz',
            questions: questions,
            passing_score: 70 // default
        };
        onChangeRef.current(JSON.stringify(quizData));
    }, [questions]);

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            text: '',
            options: ['', ''],
            correctAnswer: 0
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const updateQuestionText = (index: number, text: string) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], text };
        setQuestions(newQuestions);
    };

    const addOption = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex] = {
            ...newQuestions[qIndex],
            options: [...newQuestions[qIndex].options, '']
        };
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        // Don't allow less than 2 options
        if (newQuestions[qIndex].options.length <= 2) return;

        const newOptions = [...newQuestions[qIndex].options];
        newOptions.splice(oIndex, 1);

        // Adjust correct answer index if needed
        let newCorrectAnswer = newQuestions[qIndex].correctAnswer;
        if (newCorrectAnswer >= oIndex) {
            newCorrectAnswer = Math.max(0, newCorrectAnswer - 1);
        }

        newQuestions[qIndex] = {
            ...newQuestions[qIndex],
            options: newOptions,
            correctAnswer: newCorrectAnswer
        };
        setQuestions(newQuestions);
    };

    const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
        const newQuestions = [...questions];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[oIndex] = text;
        newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
        setQuestions(newQuestions);
    };

    const setCorrectAnswer = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex] = { ...newQuestions[qIndex], correctAnswer: oIndex };
        setQuestions(newQuestions);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Quiz Questions ({questions.length})</label>
            </div>

            <div className="space-y-4">
                {questions.map((q, qIndex) => (
                    <div key={q.id} className="bg-[var(--background-secondary)]/50 rounded-lg p-4 border border-[var(--border-color)]">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded text-xs font-bold mt-1">
                                Q{qIndex + 1}
                            </span>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Enter question text..."
                                    className="input-field w-full mb-2"
                                    value={q.text}
                                    onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                />

                                <div className="space-y-2 pl-2 border-l-2 border-[var(--border-color)]">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`correct-${q.id}`}
                                                checked={q.correctAnswer === oIndex}
                                                onChange={() => setCorrectAnswer(qIndex, oIndex)}
                                                className="w-4 h-4 text-[var(--primary)]"
                                                title="Mark as correct answer"
                                            />
                                            <input
                                                type="text"
                                                placeholder={`Option ${oIndex + 1}`}
                                                className="input-field flex-1 text-sm py-1"
                                                value={opt}
                                                onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                            />
                                            {q.options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(qIndex, oIndex)}
                                                    className="p-1 text-[var(--text-muted)] hover:text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addOption(qIndex)}
                                        className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 mt-2"
                                    >
                                        <Plus className="w-3 h-3" /> Add Option
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 rounded"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add Question
            </button>
        </div>
    );
}
