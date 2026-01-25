'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    const navLinks = [
        { href: '#tracks', label: 'Program' },
        { href: '#features', label: 'Fitur' },
        { href: '#curriculum', label: 'Kurikulum' },
        { href: '#faq', label: 'FAQ' },
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
                        ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-white/5 py-3'
                        : 'bg-transparent border-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group relative z-50">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                            <Zap className="w-5 h-5 text-white fill-white/20" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
                            Zenith <span className="text-blue-500">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white rounded-full hover:bg-white/10 transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons & Mobile Toggle */}
                    <div className="flex items-center gap-3 relative z-50">
                        <Link
                            href="/login"
                            className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span>Daftar Gratis</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-[#0a0a0f] md:hidden pt-24 px-4 pb-8 flex flex-col"
                    >
                        <div className="flex flex-col gap-2 mb-8">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (i * 0.05) }}
                                >
                                    <Link
                                        href={link.href}
                                        className="block p-4 text-lg font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-auto space-y-3"
                        >
                            <Link
                                href="/login"
                                className="flex items-center justify-center w-full p-4 text-center font-medium text-[var(--text-secondary)] hover:text-white border border-white/10 rounded-2xl hover:bg-white/5 transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="flex items-center justify-center w-full p-4 text-center font-bold text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Daftar Gratis Sekarang
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
