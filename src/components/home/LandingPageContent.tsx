'use client';

import Link from 'next/link';
import { Rocket, Wrench, Briefcase, ChevronRight, Zap, Users, Trophy, CheckCircle, HelpCircle, Star, ArrowRight } from 'lucide-react';
import { useEffect, useRef, ReactNode } from 'react';
import LandingHeader from '@/components/layout/LandingHeader';

// Scroll-triggered animation component
function AnimatedSection({
    children,
    className = '',
    animation = 'fade-in-up',
    delay = 0
}: {
    children: ReactNode;
    className?: string;
    animation?: 'fade-in-up' | 'fade-in-scale' | 'slide-in-left' | 'slide-in-right';
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(`animate-${animation}`);
                        if (delay > 0) {
                            entry.target.classList.add(`delay-${delay}`);
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [animation, delay]);

    return (
        <div ref={ref} className={`opacity-0 ${className}`}>
            {children}
        </div>
    );
}

interface LandingPageContentProps {
    user?: any;
}

export default function LandingPageContent({ user }: LandingPageContentProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Header */}
            <LandingHeader user={user} />

            {/* Hero Section */}
            <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

                <div className="container max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-6 sm:mb-8 animate-fade-in-up">
                        <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                        <span className="text-xs sm:text-sm font-medium text-[var(--primary-light)] tracking-wide">Belajar AI dari Nol Sampai Jago</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight animate-fade-in-up delay-100">
                        Pelajari <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Teknik AI</span> atau{' '}
                        <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-300">Bisnis AI</span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 animate-fade-in-up delay-150">
                        Belajar coding untuk bikin sistem AI canggih, atau fokus jualan jasa AI tanpa harus jadi programmer. Semua materi bisa diakses langsung, tanpa batasan.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 animate-fade-in-up delay-200">
                        <Link href={user ? "/dashboard" : "/register"} className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-105 transition-transform animate-glow">
                            {user ? "Lanjutkan Belajar" : "Mulai Belajar Gratis"}
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                        <Link href="#tracks" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto hover:bg-white/5 transition-colors hover-lift">
                            Lihat Program
                        </Link>
                    </div>

                    <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[var(--text-muted)] text-xs sm:text-sm font-medium px-4 animate-fade-in-up delay-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                            <span>Materi Terstruktur</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                            <span>Komunitas Aktif</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                            <span>Akses Lifetime</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem / Opportunity Section */}
            <section className="py-16 sm:py-24 bg-[var(--background-secondary)]/30 border-y border-[var(--border-color)]">
                <div className="container px-4 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        <AnimatedSection animation="slide-in-left">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Kenapa Banyak yang Gagal Belajar AI?</h2>
                            <div className="space-y-4 sm:space-y-6 text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
                                <p>
                                    Kebanyakan orang cuma jadi <strong>user</strong> ChatGPT doang. Ga tau cara bikin sistem AI yang bisa menghasilkan uang atau memecahkan masalah bisnis.
                                </p>
                                <p>
                                    Belajar sendiri dari YouTube? Materinya berantakan. Ikut kursus mahal? Isinya teori melulu. Akhirnya stuck di tempat yang sama.
                                </p>
                                <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 mt-4 sm:mt-6">
                                    <p className="text-red-200 font-medium text-sm sm:text-base">
                                        &ldquo;Tanpa panduan jelas, AI cuma jadi mainan. Bukan skill yang bisa dijual.&rdquo;
                                    </p>
                                </div>
                            </div>
                        </AnimatedSection>
                        <AnimatedSection animation="slide-in-right" delay={100}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
                                <div className="glass-card p-6 sm:p-10 border-[var(--primary)]/30 hover-lift">
                                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
                                        <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--primary)] animate-float" />
                                        Solusi Kami
                                    </h3>
                                    <ul className="space-y-4 sm:space-y-5">
                                        {[
                                            "Pilih fokus: Teknik atau Bisnis",
                                            "Praktek langsung, bukan teori doang",
                                            "Template siap pakai untuk setiap proyek",
                                            "Belajar kayak main game, seru!"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 sm:gap-4" style={{ animationDelay: `${i * 75}ms` }}>
                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--success)]" />
                                                </div>
                                                <span className="text-[var(--text-primary)] text-sm sm:text-base">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Tracks Section */}
            <section id="tracks" className="py-16 sm:py-24 relative">
                <div className="absolute top-[20%] right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

                <div className="container px-4 max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-12 sm:mb-20">
                        <span className="text-[var(--primary)] font-bold tracking-wider uppercase mb-2 block text-xs sm:text-sm">Pilih yang Cocok</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Dua Jalur, Sama-sama Powerful</h2>
                        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-base sm:text-lg px-4">
                            Ga semua orang suka coding. Ga semua orang jago jualan. Makanya kami sediain dua jalur biar lo fokus ke kekuatan lo.
                        </p>
                    </AnimatedSection>

                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start mb-8">
                        {/* Engineer Track */}
                        <AnimatedSection animation="slide-in-left">
                            <div className="glass-card p-6 sm:p-8 group cursor-pointer hover:border-blue-500/50 transition-all duration-300 relative hover-lift">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                                    <Wrench className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
                                </div>

                                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-blue-400 transition-colors">Jalur Engineer</h3>
                                <p className="text-[var(--text-secondary)] mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                                    Suka bikin sesuatu? Di sini lo belajar rakit sistem AI sendiri, dari nol. Integrasiin API, bikin chatbot, sampe automation workflow.
                                </p>

                                <div className="space-y-4 mb-6 sm:mb-8">
                                    <div className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Lo Bakal Belajar:</div>
                                    <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                                        {['Python & Automation', 'LangChain & LLM', 'Vector Database', 'Deploy ke Cloud'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link href={user ? "/dashboard" : "/register"} className="btn-secondary w-full py-2.5 sm:py-3 text-center text-sm sm:text-base group-hover:bg-blue-500 group-hover:border-blue-500 transition-all">
                                    Mulai Sekarang
                                </Link>
                            </div>
                        </AnimatedSection>

                        {/* Entrepreneur Track */}
                        <AnimatedSection animation="slide-in-right" delay={100}>
                            <div className="glass-card p-6 sm:p-8 group cursor-pointer hover:border-emerald-500/50 transition-all duration-300 relative hover-lift">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                                    <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />
                                </div>

                                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-emerald-400 transition-colors">Jalur Entrepreneur</h3>
                                <p className="text-[var(--text-secondary)] mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                                    Lebih suka bisnis? Pelajari cara jualan solusi AI tanpa harus jadi programmer. Dari nyari klien sampai closing deal.
                                </p>

                                <div className="space-y-4 mb-6 sm:mb-8">
                                    <div className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Lo Bakal Belajar:</div>
                                    <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                                        {['Bikin Penawaran Menarik', 'Marketing & Sales', 'Psikologi Jualan', 'Manage Klien'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link href={user ? "/dashboard" : "/register"} className="btn-secondary w-full py-2.5 sm:py-3 text-center text-sm sm:text-base group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all">
                                    Mulai Sekarang
                                </Link>
                            </div>
                        </AnimatedSection>
                    </div>

                    {/* AI Arbitrage - Now accessible */}
                    <AnimatedSection className="mx-auto max-w-3xl">
                        <div className="glass-card p-6 sm:p-8 border-amber-500/30 bg-amber-500/5 relative overflow-hidden hover-lift hover-glow animate-shimmer">
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                                Bonus Materi
                            </div>

                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 sm:mb-8">
                                <Rocket className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 animate-float" />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-amber-100">AI Arbitrage Blueprint</h3>
                            <p className="text-amber-100/70 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                                Bonus template lengkap! Source code, landing page, email marketing, sampe kontrak legal. Tinggal pakai buat proyek lo sendiri.
                            </p>

                            <div className="space-y-4 mb-6 sm:mb-8">
                                <div className="text-xs sm:text-sm font-semibold text-amber-500/80 uppercase tracking-wider">Isi Paket:</div>
                                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-amber-100/60">
                                    {['Source Code Lengkap', 'Landing Page Template', 'Email Marketing Scripts', 'Template Kontrak'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link href={user ? "/dashboard" : "/register"} className="btn-secondary w-full py-2.5 sm:py-3 text-center text-sm sm:text-base border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                                Akses Sekarang
                            </Link>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Curriculum Details Section */}
            <section id="curriculum" className="py-16 sm:py-24 bg-[var(--background-secondary)]/30">
                <div className="container px-4 max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        <AnimatedSection animation="slide-in-left" className="lg:w-1/2">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Kurikulum Praktek Langsung</h2>
                            <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                                Semua materi fokus ke hasil nyata. Setiap modul bakal ngasih lo project yang bisa langsung masuk portofolio atau dipake buat cuan.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: "Minggu 1-2: Dasar & Setup", desc: "Paham landscape AI sekarang, setup tools, dan mindset yang bener." },
                                    { title: "Minggu 3-4: Bikin MVP", desc: "Langsung eksekusi! Engineer coding, Entrepreneur riset pasar dan bikin strategi." },
                                    { title: "Minggu 5-6: Advanced Topics", desc: "Multi-agent system, vector database, sampe long-term memory." },
                                    { title: "Minggu 7-8: Monetize", desc: "Cara harga jasa lo, cari klien pertama, dan manage ekspektasi mereka." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3 sm:gap-4" style={{ animationDelay: `${i * 75}ms` }}>
                                        <div className="flex flex-col items-center">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                                                {i + 1}
                                            </div>
                                            {i < 3 && <div className="w-0.5 flex-grow bg-[var(--border-color)] my-2" />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h4>
                                            <p className="text-[var(--text-secondary)] text-sm sm:text-base">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AnimatedSection>

                        <AnimatedSection animation="slide-in-right" delay={100} className="lg:w-1/2">
                            <div className="sticky top-24">
                                <div className="glass-card p-1 bg-gradient-to-b from-[var(--primary)]/20 to-transparent hover-lift">
                                    <div className="bg-[#0a0a0f] rounded-xl overflow-hidden aspect-video relative group">
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/30 transition-all cursor-pointer">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform animate-pulse">
                                                <div className="w-0 h-0 border-t-[8px] sm:border-t-[10px] border-t-transparent border-l-[14px] sm:border-l-[18px] border-l-white border-b-[8px] sm:border-b-[10px] border-b-transparent ml-1" />
                                            </div>
                                        </div>
                                        <div className="w-full h-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--text-muted)] text-sm sm:text-base px-4">
                                            Preview Platform
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                                            <span className="text-xs sm:text-sm font-medium text-[var(--primary-light)]">Platform Demo</span>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-800 border-2 border-[#0a0a0f] flex items-center justify-center text-xs text-white">
                                                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </div>
                                                ))}
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[var(--primary)] border-2 border-[#0a0a0f] flex items-center justify-center text-xs text-white font-bold">
                                                    +2k
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                                            Join 2,000+ member yang lagi bangun skill AI mereka di sini.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Features / Gamification Section */}
            <section id="features" className="py-16 sm:py-24">
                <div className="container px-4 max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Belajar Asyik, Ga Ngebosenin</h2>
                        <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-base sm:text-lg">
                            Kami bikin pembelajaran se-engaging mungkin biar lo betah dan konsisten.
                        </p>
                    </AnimatedSection>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <AnimatedSection delay={75}>
                            <div className="glass-card p-6 sm:p-8 text-center hover:bg-[var(--background-secondary)] transition-colors hover-lift h-full">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--primary)]" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Progress Sistematis</h3>
                                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                                    Materi tersusun rapi. Belajar step-by-step, ga loncat-loncat.
                                </p>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection delay={150}>
                            <div className="glass-card p-6 sm:p-8 text-center hover:bg-[var(--background-secondary)] transition-colors hover-lift h-full">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--success)]" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Poin & Leaderboard</h3>
                                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                                    Kumpulin poin tiap selesai tugas. Lihat ranking lo di leaderboard global.
                                </p>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection delay={200} className="sm:col-span-2 lg:col-span-1">
                            <div className="glass-card p-6 sm:p-8 text-center hover:bg-[var(--background-secondary)] transition-colors hover-lift h-full">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--warning)]/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--warning)]" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Komunitas Solid</h3>
                                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                                    Diskusi real-time, share project, networking sama orang-orang yang sama visinya.
                                </p>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-16 sm:py-24 bg-[var(--background-secondary)]/30 border-y border-[var(--border-color)]">
                <div className="container px-4 max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Yang Sering Ditanya</h2>
                    </AnimatedSection>

                    <div className="space-y-4 sm:space-y-6">
                        {[
                            { q: "Harus punya basic IT ga buat Jalur Engineer?", a: "Ga wajib, tapi lebih enak kalau udah pernah ngoding dikit. Kami mulai dari dasar Python kok, cuma progresnya lumayan cepet. Kalau lo nol besar tapi punya logika kuat dan semangat belajar tinggi, bisa banget." },
                            { q: "Berapa lama bisa selesai?", a: "Rata-rata 8 minggu kalau lo commit 5-7 jam per minggu. Tapi tenang, akses materi selamanya. Jadi bisa belajar sesuai pace lo sendiri." },
                            { q: "AI Arbitrage Blueprint itu apa?", a: "Template lengkap buat lo yang mau langsung jualan. Ada source code, landing page, email marketing, sampe kontrak legal. Tinggal customize sesuai kebutuhan." },
                            { q: "Ada jaminan kerja?", a: "Kami bukan job portal ya. Kami ngajarin lo jadi profesional atau pengusaha yang mandiri. Tapi ada channel khusus buat member top performer yang sering dapat info project." }
                        ].map((faq, i) => (
                            <AnimatedSection key={i} delay={i * 75 as 75 | 150}>
                                <div className="glass-card p-5 sm:p-6 rounded-2xl hover-lift">
                                    <h4 className="flex items-start gap-3 font-bold text-base sm:text-lg mb-2 sm:mb-3">
                                        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)] shrink-0 mt-0.5" />
                                        {faq.q}
                                    </h4>
                                    <p className="text-[var(--text-secondary)] pl-8 sm:pl-9 leading-relaxed text-sm sm:text-base">
                                        {faq.a}
                                    </p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 sm:py-24">
                <div className="container px-4 max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Kata Mereka</h2>
                        <p className="text-[var(--text-secondary)] text-sm sm:text-base">Join ratusan orang yang udah mulai perjalanan AI mereka.</p>
                    </AnimatedSection>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { name: "Rizky A.", role: "Freelance Automator", content: "Dulu gw cuma admin sosmed biasa. Setelah ambil Jalur Engineer, sekarang handle 3 klien luar negeri bikin bot lead generation. Income naik 5x.", stars: 5 },
                            { name: "Sarah P.", role: "Agency Owner", content: "Jalur Entrepreneur ngubah mindset gw total. Teknis penting, tapi jualan itu kunci. Blueprint-nya super helpful buat kickstart bisnis gw.", stars: 5 },
                            { name: "Budi S.", role: "Software Developer", content: "Materi teknisnya padat banget. Ga banyak ngomong, langsung ke studi kasus yang relate sama industri sekarang.", stars: 4 }
                        ].map((testi, i) => (
                            <AnimatedSection key={i} delay={(i * 75) as 75 | 150}>
                                <div className="glass-card p-6 sm:p-8 hover-lift h-full">
                                    <div className="flex gap-1 mb-3 sm:mb-4">
                                        {[...Array(5)].map((_, s) => (
                                            <Star key={s} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s < testi.stars ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}`} />
                                        ))}
                                    </div>
                                    <p className="text-[var(--text-secondary)] mb-4 sm:mb-6 italic text-sm sm:text-base">&ldquo;{testi.content}&rdquo;</p>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center font-bold text-[var(--primary)] text-sm sm:text-base">
                                            {testi.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm sm:text-base">{testi.name}</div>
                                            <div className="text-xs text-[var(--text-muted)]">{testi.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 -z-10" />
                <div className="container px-4 max-w-5xl mx-auto">
                    <AnimatedSection animation="fade-in-scale">
                        <div className="glass-card p-8 sm:p-12 text-center border-[var(--primary)]/30 relative overflow-hidden hover-glow">
                            {/* Decorative background glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[var(--primary)]/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                                Jangan Ketinggalan
                            </h2>
                            <p className="text-[var(--text-secondary)] mb-8 sm:mb-10 max-w-2xl mx-auto text-base sm:text-xl px-4">
                                Harga bakal naik bulan depan. Daftar sekarang dan mulai perjalanan AI lo hari ini juga.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                                <Link href={user ? "/dashboard" : "/register"} className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-3 w-full sm:w-auto justify-center animate-glow">
                                    {user ? "Lanjutkan Belajar" : "Daftar Sekarang"}
                                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                </Link>
                            </div>
                            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-[var(--text-muted)]">
                                30 hari garansi uang kembali kalau ga cocok.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 sm:py-12 border-t border-[var(--border-color)] bg-[#050508]">
                <div className="container px-4 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
                        <div className="sm:col-span-2">
                            <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)] animate-float" />
                                <span className="font-bold text-lg sm:text-xl text-gradient">Zenith AI Academy</span>
                            </div>
                            <p className="text-[var(--text-secondary)] max-w-md leading-relaxed text-sm sm:text-base">
                                Platform belajar AI pertama di Indonesia yang nyelarin antara skill teknis dan strategi bisnis. Bikin generasi baru Engineer dan Entrepreneur yang siap hadapi masa depan.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 sm:mb-6 text-white text-sm sm:text-base">Program</h4>
                            <ul className="space-y-3 sm:space-y-4 text-[var(--text-muted)] text-sm">
                                <li><Link href="#tracks" className="hover:text-[var(--primary)] transition">Jalur Engineer</Link></li>
                                <li><Link href="#tracks" className="hover:text-[var(--primary)] transition">Jalur Entrepreneur</Link></li>
                                <li><Link href="#tracks" className="hover:text-[var(--primary)] transition">AI Arbitrage</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 sm:mb-6 text-white text-sm sm:text-base">Perusahaan</h4>
                            <ul className="space-y-3 sm:space-y-4 text-[var(--text-muted)] text-sm">
                                <li><Link href="#" className="hover:text-[var(--primary)] transition">Tentang Kami</Link></li>
                                <li><Link href="#" className="hover:text-[var(--primary)] transition">Karir</Link></li>
                                <li><Link href="#" className="hover:text-[var(--primary)] transition">Kontak</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-white/5 text-center sm:text-left text-xs sm:text-sm text-[var(--text-muted)] flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p>© 2026 Zenith AI Academy. All rights reserved.</p>
                        <div className="flex gap-4 sm:gap-6">
                            <Link href="#" className="hover:text-white transition">Privacy</Link>
                            <Link href="#" className="hover:text-white transition">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
