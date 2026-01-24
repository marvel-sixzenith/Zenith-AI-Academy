'use client';

import { useState, useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';

interface OnboardingTourProps {
    user: any;
}

export default function OnboardingTour({ user }: OnboardingTourProps) {
    const [showWelcome, setShowWelcome] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!user?.email) return;

        // Check local storage first to prevent stale session loop
        // Use email-specific key so different accounts on same browser don't block each other
        const storageKey = `zenith_onboarding_completed_${user.email}`;
        const isLocalCompleted = localStorage.getItem(storageKey);
        const isTourActive = sessionStorage.getItem('onboarding_active');

        if (user && !user.hasCompletedOnboarding && !isLocalCompleted && !isTourActive) {
            setShowWelcome(true);
        }
    }, [user]);

    const handleComplete = async () => {
        if (!user?.email) return;

        // Set local lock immediately to prevent loop
        const storageKey = `zenith_onboarding_completed_${user.email}`;
        localStorage.setItem(storageKey, 'true');
        sessionStorage.removeItem('onboarding_active');

        try {
            await fetch('/api/user/onboarding', { method: 'POST' });
            router.refresh();
        } catch (error) {
            console.error('Failed to save onboarding status', error);
        }
    };

    const startTour = () => {
        setShowWelcome(false);
        sessionStorage.setItem('onboarding_active', 'true');

        // Wait for modal to unmount before starting tour
        setTimeout(() => {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                doneBtnText: 'Finish',
                nextBtnText: 'Next',
                prevBtnText: 'Previous',
                allowClose: true,
                onDestroyed: () => {
                    // Ensure we mark specific completion if destroyed
                    const storageKey = `zenith_onboarding_completed_${user?.email}`;
                    if (!localStorage.getItem(storageKey)) {
                        handleComplete();
                    }
                },
                steps: [
                    {
                        element: '#nav-dashboard',
                        popover: {
                            title: 'Dashboard',
                            description: 'Your main command center. Track daily streaks and progress here.',
                            onNextClick: () => {
                                router.push('/tracks');
                                driverObj.moveNext();
                            }
                        }
                    },
                    {
                        element: '#nav-tracks',
                        popover: {
                            title: 'Materi Belajar',
                            description: 'Access all your courses and modules here.',
                            onNextClick: () => {
                                router.push('/community');
                                driverObj.moveNext();
                            }
                        }
                    },
                    {
                        element: '#nav-community',
                        popover: {
                            title: 'Komunitas',
                            description: 'Join discussions and connect with other learners.',
                            onNextClick: () => {
                                router.push('/leaderboard');
                                driverObj.moveNext();
                            }
                        }
                    },
                    {
                        element: '#nav-leaderboard',
                        popover: {
                            title: 'Papan Peringkat',
                            description: 'See where you stand against your peers.',
                            onNextClick: () => {
                                router.push('/profile');
                                driverObj.moveNext();
                            }
                        }
                    },
                    {
                        element: '#nav-profile',
                        popover: {
                            title: 'Profil Saya',
                            description: 'Manage your account settings and preferences.'
                        }
                    }
                ]
            });

            driverObj.drive();
        }, 100);
    };

    const handleSkipWelcome = () => {
        setShowWelcome(false);
        handleComplete();
    };

    if (!showWelcome) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />

            <div className="relative w-full max-w-md bg-[#0B1221] border border-[var(--border-color)] rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-300 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-6">
                    <Rocket className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold mb-4 text-white">
                    Welcome to Zenith AI Academy, {user?.name?.split(' ')[0]}!
                </h2>

                <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                    Let's get you set up for success. Take a quick tour of your command center.
                </p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleSkipWelcome}
                        className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium"
                    >
                        Skip
                    </button>
                    <button
                        onClick={startTour}
                        className="px-6 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition shadow-lg shadow-blue-500/20 font-medium"
                    >
                        Start Tour
                    </button>
                </div>
            </div>
        </div>
    );
}
