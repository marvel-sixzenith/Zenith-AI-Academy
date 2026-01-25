'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Driver, DriveStep } from 'driver.js';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { useMobileMenu } from '@/components/layout/MobileMenuContext';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingTourProps {
    user: any;
}

// Responsive breakpoint matching Tailwind's lg
const MOBILE_BREAKPOINT = 1024;

export default function OnboardingTour({ user }: OnboardingTourProps) {
    const [showWelcome, setShowWelcome] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const { openMobileMenu } = useMobileMenu();
    const driverRef = useRef<Driver | null>(null);

    // Ensure we're on client side before accessing window
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Detect mobile/desktop - only runs on client
    useEffect(() => {
        if (!isClient) return;

        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [isClient]);

    useEffect(() => {
        if (!isClient || !user?.email) return;

        // Check local storage first to prevent stale session loop
        const storageKey = `zenith_onboarding_completed_${user.email}`;
        const isLocalCompleted = localStorage.getItem(storageKey);
        const isTourActive = sessionStorage.getItem('onboarding_active');

        if (user && user.role === 'MEMBER' && !user.hasCompletedOnboarding && !isLocalCompleted && !isTourActive) {
            setShowWelcome(true);
        }
    }, [user, isClient]);

    const handleComplete = useCallback(async () => {
        if (!user?.email) return;

        const storageKey = `zenith_onboarding_completed_${user.email}`;
        localStorage.setItem(storageKey, 'true');
        sessionStorage.removeItem('onboarding_active');

        try {
            await fetch('/api/user/onboarding', { method: 'POST' });
            router.refresh();
        } catch (error) {
            console.error('Failed to save onboarding status', error);
        }
    }, [user?.email, router]);

    const startTour = useCallback(async () => {
        setShowWelcome(false);
        sessionStorage.setItem('onboarding_active', 'true');

        // Dynamically import driver.js and its CSS
        const { driver } = await import('driver.js');
        // @ts-ignore
        await import('driver.js/dist/driver.css');

        // Check current screen size at tour start time
        const isMobileNow = window.innerWidth < MOBILE_BREAKPOINT;
        const prefix = isMobileNow ? '#mobile-nav-' : '#nav-';

        // On mobile, open menu first then start tour
        const initTour = () => {
            const steps: DriveStep[] = [
                {
                    element: `${prefix}dashboard`,
                    popover: {
                        title: 'Dashboard',
                        description: 'Your main command center. Track daily streaks and progress here.',
                        onNextClick: () => {
                            router.push('/tracks');
                            if (isMobileNow) {
                                setTimeout(() => openMobileMenu(), 300);
                            }
                            driverRef.current?.moveNext();
                        }
                    }
                },
                {
                    element: `${prefix}tracks`,
                    popover: {
                        title: 'Materi Belajar',
                        description: 'Access all your courses and modules here.',
                        onNextClick: () => {
                            router.push('/community');
                            if (isMobileNow) {
                                setTimeout(() => openMobileMenu(), 300);
                            }
                            driverRef.current?.moveNext();
                        }
                    }
                },
                {
                    element: `${prefix}community`,
                    popover: {
                        title: 'Komunitas',
                        description: 'Join discussions and connect with other learners.',
                        onNextClick: () => {
                            router.push('/leaderboard');
                            if (isMobileNow) {
                                setTimeout(() => openMobileMenu(), 300);
                            }
                            driverRef.current?.moveNext();
                        }
                    }
                },
                {
                    element: `${prefix}leaderboard`,
                    popover: {
                        title: 'Papan Peringkat',
                        description: 'See where you stand against your peers.',
                        onNextClick: () => {
                            router.push('/profile');
                            if (isMobileNow) {
                                setTimeout(() => openMobileMenu(), 300);
                            }
                            driverRef.current?.moveNext();
                        }
                    }
                },
                {
                    element: `${prefix}profile`,
                    popover: {
                        title: 'Profil Saya',
                        description: 'Manage your account settings and preferences.'
                    }
                }
            ];

            driverRef.current = driver({
                showProgress: true,
                animate: true,
                doneBtnText: 'Finish',
                nextBtnText: 'Next',
                prevBtnText: 'Previous',
                allowClose: true,
                popoverClass: 'onboarding-popover',
                onDestroyed: () => {
                    const storageKey = `zenith_onboarding_completed_${user?.email}`;
                    if (!localStorage.getItem(storageKey)) {
                        handleComplete();
                    }
                },
                steps
            });

            driverRef.current.drive();
        };

        // Wait for modal to unmount, then start tour
        setTimeout(() => {
            if (isMobileNow) {
                openMobileMenu();
                // Wait for menu animation
                setTimeout(initTour, 200);
            } else {
                initTour();
            }
        }, 100);
    }, [openMobileMenu, router, user?.email, handleComplete]);

    const handleSkipWelcome = () => {
        setShowWelcome(false);
        handleComplete();
    };

    // Don't render anything on server
    if (!isClient) return null;

    return (
        <AnimatePresence>
            {showWelcome && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop with fade animation */}
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    />

                    {/* Modal with scale + fade animation */}
                    <motion.div
                        className="relative w-full max-w-md bg-[#0B1221] border border-[var(--border-color)] rounded-2xl shadow-2xl p-8 text-center"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                    >
                        <motion.div
                            className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-6"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
                        >
                            <Rocket className="w-8 h-8" />
                        </motion.div>

                        <motion.h2
                            className="text-2xl font-bold mb-4 text-white"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            Welcome to Zenith AI Academy, {user?.name?.split(' ')[0]}!
                        </motion.h2>

                        <motion.p
                            className="text-[var(--text-secondary)] mb-8 leading-relaxed"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.3 }}
                        >
                            Let's get you set up for success. Take a quick tour of your command center.
                        </motion.p>

                        <motion.div
                            className="flex gap-3 justify-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
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
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

