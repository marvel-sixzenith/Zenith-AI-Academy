'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X, CheckSquare, Type, List, AlignLeft, CheckCircle, Settings, HelpCircle } from 'lucide-react';

type QuestionType = 'MULTIPLE_CHOICE' | 'DROPDOWN' | 'CHECKBOXES' | 'SHORT_ANSWER' | 'PARAGRAPH';

interface Question {
    id: string;
    type: QuestionType;
    text: string;
    options?: string[]; // For MC, Dropdown, Checkboxes
    correctAnswer?: number | number[] | string; // Index, Indices, or Text
}

interface QuizSettings {
    passingScore: number;
    showScoreImmediate: boolean;
    shuffleQuestions: boolean;
    requireAll: boolean;
    allowRetries: boolean;
    maxRetries: number;
}

interface QuizEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function QuizEditor({ value, onChange }: QuizEditorProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [settings, setSettings] = useState<QuizSettings>({
        passingScore: 70,
        showScoreImmediate: true,
        shuffleQuestions: false,
        requireAll: true,
        allowRetries: true,
        maxRetries: 3
    });
    const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');

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
                // Migrate legacy questions
                const migratedQuestions = parsed.questions.map((q: any) => ({
                    ...q,
                    type: q.type || 'MULTIPLE_CHOICE',
                    options: q.options || [],
                    // Ensure correctAnswer is preserved
                }));
                setQuestions(migratedQuestions);

                // Parse settings if available, else use defaults
                if (parsed.settings) {
                    setSettings({
                        passingScore: parsed.settings.passingScore ?? 70,
                        showScoreImmediate: parsed.settings.showScoreImmediate ?? true,
                        shuffleQuestions: parsed.settings.shuffleQuestions ?? false,
                        requireAll: parsed.settings.requireAll ?? true,
                        allowRetries: parsed.settings.allowRetries ?? true,
                        maxRetries: parsed.settings.maxRetries ?? 3
                    });
                }
            }
            // Always mark as initialized after first parse attempt, 
            // even if empty (new quiz) or invalid (reset)
            hasLoadedRef.current = true;
            isInitializedRef.current = true;
        } catch {
            // Ignore parse errors, start empty
            // Also mark as initialized so we can start adding questions
            hasLoadedRef.current = true;
            isInitializedRef.current = true;
        }
    }, [value]);

    // Update parent whenever questions or settings change
    useEffect(() => {
        if (!isInitializedRef.current) return;

        const quizData = {
            type: 'quiz',
            questions: questions,
            settings: settings,
            // Legacy support for top-level props if needed by other components temporarily
            passing_score: settings.passingScore
        };
        onChangeRef.current(JSON.stringify(quizData));
    }, [questions, settings]);

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            type: 'MULTIPLE_CHOICE',
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

    const updateQuestionType = (index: number, type: QuestionType) => {
        const newQuestions = [...questions];
        const q = newQuestions[index];

        q.type = type;

        // Reset fields based on type
        if (type === 'SHORT_ANSWER' || type === 'PARAGRAPH') {
            q.options = undefined;
            q.correctAnswer = '';
        } else if (type === 'CHECKBOXES') {
            q.options = q.options || ['', ''];
            q.correctAnswer = [0]; // Default to first option correct
        } else {
            // MC or Dropdown
            q.options = q.options || ['', ''];
            q.correctAnswer = 0;
        }

        setQuestions(newQuestions);
    };

    const updateQuestionText = (index: number, text: string) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], text };
        setQuestions(newQuestions);
    };

    // Options Management
    const addOption = (qIndex: number) => {
        const newQuestions = [...questions];
        const q = newQuestions[qIndex];
        if (!q.options) q.options = [];

        q.options.push('');
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        const q = newQuestions[qIndex];
        if (!q.options || q.options.length <= 2) return;

        q.options.splice(oIndex, 1);

        // Adjust correct answers
        if (Array.isArray(q.correctAnswer)) {
            // Filter out the removed index and shift others
            q.correctAnswer = q.correctAnswer
                .filter(idx => idx !== oIndex)
                .map(idx => (idx > oIndex ? idx - 1 : idx));
        } else if (typeof q.correctAnswer === 'number') {
            if (q.correctAnswer === oIndex) q.correctAnswer = 0;
            else if (q.correctAnswer > oIndex) q.correctAnswer--;
        }

        setQuestions(newQuestions);
    };

    const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
        const newQuestions = [...questions];
        const q = newQuestions[qIndex];
        if (q.options) {
            q.options[oIndex] = text;
            setQuestions(newQuestions);
        }
    };

    // Correct Answer Logic
    const setCorrectAnswer = (qIndex: number, value: any) => {
        const newQuestions = [...questions];
        newQuestions[qIndex] = { ...newQuestions[qIndex], correctAnswer: value };
        setQuestions(newQuestions);
    };

    const toggleCorrectOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        const q = newQuestions[qIndex];

        if (Array.isArray(q.correctAnswer)) {
            if (q.correctAnswer.includes(oIndex)) {
                // Prevent removing the last correct option
                if (q.correctAnswer.length > 1) {
                    q.correctAnswer = q.correctAnswer.filter(idx => idx !== oIndex);
                }
            } else {
                q.correctAnswer = [...q.correctAnswer, oIndex].sort();
            }
        }
        setQuestions(newQuestions);
    };

    const getIconForType = (type: QuestionType) => {
        switch (type) {
            case 'MULTIPLE_CHOICE': return <List className="w-4 h-4" />;
            case 'CHECKBOXES': return <CheckSquare className="w-4 h-4" />;
            case 'DROPDOWN': return <AlignLeft className="w-4 h-4" />; // Approximate icon
            case 'SHORT_ANSWER': return <Type className="w-4 h-4" />;
            case 'PARAGRAPH': return <AlignLeft className="w-4 h-4" />;
            default: return <List className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex border-b border-[var(--border-color)] mb-4">
                <button
                    type="button"
                    onClick={() => setActiveTab('questions')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'questions'
                            ? 'border-[var(--primary)] text-[var(--primary)]'
                            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                >
                    Questions ({questions.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'settings'
                            ? 'border-[var(--primary)] text-[var(--primary)]'
                            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    Configuration
                </button>
            </div>

            {activeTab === 'settings' ? (
                <div className="space-y-6 animate-fade-in p-2">
                    <div className="bg-[var(--background-secondary)]/30 rounded-xl p-6 border border-[var(--border-color)] space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Passing Score */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        className="flex-1"
                                        value={settings.passingScore}
                                        onChange={(e) => setSettings({ ...settings, passingScore: parseInt(e.target.value) })}
                                    />
                                    <span className="font-bold w-12 text-center">{settings.passingScore}%</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Minimum score required to mark lesson as completed.</p>
                            </div>

                            {/* Max Retries */}
                            <div>
                                <label className="block text-sm font-medium mb-2 opacity-100 flex items-center gap-2">
                                    Max Retries
                                    {!settings.allowRetries && <span className="text-xs text-red-500">(Retries disabled)</span>}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    disabled={!settings.allowRetries}
                                    className="input-field w-full disabled:opacity-50"
                                    value={settings.maxRetries}
                                    onChange={(e) => setSettings({ ...settings, maxRetries: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                            {/* Toggle Switches */}
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <div className="font-medium">Direct Feedback (Show Score)</div>
                                    <div className="text-xs text-[var(--text-muted)]">Show result card immediately after submission</div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={settings.showScoreImmediate}
                                        onChange={(e) => setSettings({ ...settings, showScoreImmediate: e.target.checked })}
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${settings.showScoreImmediate ? 'bg-[var(--primary)]' : 'bg-gray-600'}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.showScoreImmediate ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <div className="font-medium">Force All Questions</div>
                                    <div className="text-xs text-[var(--text-muted)]">Users cannot skip questions</div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={settings.requireAll}
                                        onChange={(e) => setSettings({ ...settings, requireAll: e.target.checked })}
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${settings.requireAll ? 'bg-[var(--primary)]' : 'bg-gray-600'}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.requireAll ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <div className="font-medium">Allow Retries</div>
                                    <div className="text-xs text-[var(--text-muted)]">Show "Try Again" button on failure</div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={settings.allowRetries}
                                        onChange={(e) => setSettings({ ...settings, allowRetries: e.target.checked })}
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${settings.allowRetries ? 'bg-[var(--primary)]' : 'bg-gray-600'}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.allowRetries ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <div className="font-medium">Shuffle Questions</div>
                                    <div className="text-xs text-[var(--text-muted)]">Randomize question order for each student</div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={settings.shuffleQuestions}
                                        onChange={(e) => setSettings({ ...settings, shuffleQuestions: e.target.checked })}
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${settings.shuffleQuestions ? 'bg-[var(--primary)]' : 'bg-gray-600'}`}></div>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.shuffleQuestions ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in">
                    {questions.map((q, qIndex) => (
                        <div key={q.id} className="bg-[var(--background-secondary)]/50 rounded-lg p-4 border border-[var(--border-color)]">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded text-xs font-bold mt-1">
                                    Q{qIndex + 1}
                                </span>
                                <div className="flex-1 space-y-4">
                                    {/* Question Header: Text & Type */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text"
                                            placeholder="Enter question text..."
                                            className="input-field flex-1"
                                            value={q.text}
                                            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                        />
                                        <select
                                            className="input-field w-full sm:w-48 text-sm"
                                            value={q.type}
                                            onChange={(e) => updateQuestionType(qIndex, e.target.value as QuestionType)}
                                        >
                                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                            <option value="CHECKBOXES">Checkboxes (Multi)</option>
                                            <option value="DROPDOWN">Dropdown</option>
                                            <option value="SHORT_ANSWER">Short Answer</option>
                                            <option value="PARAGRAPH">Paragraph</option>
                                        </select>
                                    </div>

                                    {/* Options Editor (MC, Checkbox, Dropdown) */}
                                    {['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(q.type) && (
                                        <div className="space-y-2 pl-2 border-l-2 border-[var(--border-color)]">
                                            <p className="text-xs text-[var(--text-muted)] mb-2">Options (Mark correct answers)</p>
                                            {q.options?.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    {q.type === 'CHECKBOXES' ? (
                                                        <input
                                                            type="checkbox"
                                                            checked={(q.correctAnswer as number[])?.includes(oIndex)}
                                                            onChange={() => toggleCorrectOption(qIndex, oIndex)}
                                                            className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                                                            title="Mark as correct option"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="radio"
                                                            name={`correct-${q.id}`}
                                                            checked={q.correctAnswer === oIndex}
                                                            onChange={() => setCorrectAnswer(qIndex, oIndex)}
                                                            className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                                                            title="Mark as correct option"
                                                        />
                                                    )}

                                                    <input
                                                        type="text"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        className="input-field flex-1 text-sm py-1"
                                                        value={opt}
                                                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                                    />
                                                    {(q.options?.length || 0) > 2 && (
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
                                    )}

                                    {/* Text Answer Editor */}
                                    {q.type === 'SHORT_ANSWER' && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-[var(--text-muted)]">Correct Answer (Exact text)</p>
                                            <input
                                                type="text"
                                                placeholder="Enter the correct answer..."
                                                className="input-field w-full"
                                                value={q.correctAnswer as string || ''}
                                                onChange={(e) => setCorrectAnswer(qIndex, e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {q.type === 'PARAGRAPH' && (
                                        <div className="p-3 bg-blue-500/10 rounded-lg text-sm text-[var(--text-secondary)]">
                                            <p className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-blue-400" />
                                                Paragraph answers are automatically marked correct if the student provides a response (participation based).
                                            </p>
                                        </div>
                                    )}
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

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-3 border-2 border-dashed border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Question
                    </button>
                </div>
            )}
        </div>
    );
}
