'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Trophy, BookOpen, Wrench, Rocket } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export default function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Check if user has seen onboarding
        const hasSeen = localStorage.getItem('zenith_has_seen_onboarding');
        if (!hasSeen) {
            // Small delay for entrance animation
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('zenith_has_seen_onboarding', 'true');
    };

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    if (!isOpen) return null;

    // Use portal to render at root level (if document exists)
    if (typeof document === 'undefined') return null;

    const content = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={handleClose}
            />

            {/* Modal Card */}
            <div className="relative bg-[var(--surface)] border border-[var(--border-color)] w-full max-w-2xl rounded-3xl shadow-2xl animate-scale-in overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--background-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] z-20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side - Visuals */}
                <div className="relative w-full md:w-2/5 bg-gradient-to-br from-[var(--primary)] to-indigo-900 p-8 flex flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />

                    {/* Animated Shapes */}
                    <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-400/30 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-6 shadow-xl">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                            Zenith AI Academy
                        </h2>
                        <p className="text-white/70 text-sm">
                            Your journey to mastering AI & Automation starts here.
                        </p>
                    </div>

                    {/* Step Indicators */}
                    <div className="relative z-10 flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={clsx(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    step === i ? "w-8 bg-white" : "w-2 bg-white/30"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Side - Content */}
                <div className="flex-1 p-8 md:p-10 flex flex-col">
                    <div className="flex-1">
                        {step === 0 && (
                            <div className="animate-slide-in-right space-y-6">
                                <div className="space-y-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full">
                                        Welcome aboard
                                    </span>
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                                        Welcome to the Future of Learning
                                    </h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed">
                                        You've joined a community of innovators. Zenith AI Academy is designed to take you from beginner to expert through hands-on projects and real-world scenarios.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="animate-slide-in-right space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                                        Choose Your Path
                                    </h3>
                                    <p className="text-[var(--text-secondary)] text-sm mb-6">
                                        We offer specialized tracks tailored to your career goals.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl bg-[var(--background-secondary)]/50 border border-[var(--border-color)] flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                                            <Wrench className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Automation Engineer</h4>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                                Master n8n, API integrations, and backend logic to build powerful autonomous systems.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-[var(--background-secondary)]/50 border border-[var(--border-color)] flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">AI Technology</h4>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                                Deep dive into LLMs, prompt engineering, and building AI agents.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-slide-in-right space-y-6">
                                <div className="text-center md:text-left">
                                    <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                                        <Trophy className="w-8 h-8 text-yellow-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                                        Earn Points & Rank Up
                                    </h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                                        Every lesson you complete earns you points. Keep your daily streak alive and climb the global leaderboard to showcase your skills.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-lg bg-[var(--background-secondary)] text-center">
                                            <p className="text-2xl font-bold text-[var(--primary)]">10+</p>
                                            <p className="text-xs text-[var(--text-muted)]">Pts per Lesson</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-[var(--background-secondary)] text-center">
                                            <p className="text-2xl font-bold text-orange-500">🔥</p>
                                            <p className="text-xs text-[var(--text-muted)]">Daily Streaks</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                        <button
                            onClick={handleClose}
                            className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            Skip Tour
                        </button>
                        <button
                            onClick={handleNext}
                            className="btn-primary px-8"
                        >
                            {step === 2 ? "Get Started" : "Next"}
                            {step === 2 ? <Check className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
