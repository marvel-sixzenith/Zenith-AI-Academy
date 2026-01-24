'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Map, Users, User, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface OnboardingTourProps {
    user: any;
}

const steps = [
    {
        title: "Welcome to Zenith AI Academy! 🚀",
        description: "Your journey to mastering AI and Engineering starts here. Let's take a quick tour of your new learning platform.",
        icon: Rocket,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        title: "Your Dashboard",
        description: "This is your command center. Track your daily streak, view your progress, and jump right back into your last lesson.",
        icon: LayoutDashboard,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    {
        title: "Learning Tracks",
        description: "Choose your path! Whether it's Engineering or Technology, our curated tracks guide you from beginner to pro.",
        icon: Map,
        color: "text-orange-500",
        bg: "bg-orange-500/10"
    },
    {
        title: "Community",
        description: "You're not alone. Connect with other students, ask questions, and share your projects in our vibrant community channels.",
        icon: Users,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    },
    {
        title: "Customize Profile",
        description: "Make it yours. Upload a photo, update your bio, and show off your badges as you level up.",
        icon: User,
        color: "text-pink-500",
        bg: "bg-pink-500/10"
    }
];

export default function OnboardingTour({ user }: OnboardingTourProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();

    useEffect(() => {
        // Only show if user hasn't completed onboarding
        if (user && !user.hasCompletedOnboarding) {
            setIsOpen(true);
        }
    }, [user]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    const handleFinish = async () => {
        setIsOpen(false);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Mark as completed in DB
        try {
            await fetch('/api/user/onboarding', { method: 'POST' });
            router.refresh();
        } catch (error) {
            console.error('Failed to save onboarding status', error);
        }
    };

    if (!isOpen) return null;

    const CurrentIcon = steps[currentStep].icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />

            <div className="relative w-full max-w-lg bg-[#0B1221] border border-[var(--border-color)] rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= currentStep ? 'bg-[var(--primary)]' : 'bg-[var(--surface)]'
                                }`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[280px] flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${steps[currentStep].bg} ${steps[currentStep].color} animate-in zoom-in duration-300 key-${currentStep}`}>
                        <CurrentIcon className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 key-title-${currentStep}">
                        {steps[currentStep].title}
                    </h2>

                    <p className="text-[var(--text-secondary)] leading-relaxed text-lg animate-in fade-in slide-in-from-bottom-3 duration-500 key-desc-${currentStep}">
                        {steps[currentStep].description}
                    </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-color)]">
                    <button
                        onClick={handleFinish}
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        Skip Tour
                    </button>

                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--background-secondary)] transition flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            {currentStep === steps.length - 1 ? "Let's Start!" : 'Next'}
                            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
