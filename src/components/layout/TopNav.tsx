'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
    Menu,
    X,
    Bell,
    Search,
    LogOut,
    User,
    Zap,
    LayoutDashboard,
    BookOpen,
    Users,
    Trophy,
    Settings
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

interface TopNavProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string;
        image?: string | null;
    };
}

const mobileNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tracks', label: 'Materi Belajar', icon: BookOpen },
    { href: '/community', label: 'Komunitas', icon: Users },
    { href: '/leaderboard', label: 'Papan Peringkat', icon: Trophy },
    { href: '/profile', label: 'Profil Saya', icon: User },
];

export default function TopNav({ user }: TopNavProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const isAdmin = user.role === 'ADMIN';

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <>
            {/* Top Navigation Bar */}
            <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 h-16 bg-[var(--background-secondary)]/80 backdrop-blur-lg border-b border-[var(--border-color)]">
                <div className="h-full px-4 flex items-center justify-between">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-[var(--background-card)] text-[var(--text-secondary)]"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Mobile Logo */}
                    <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
                        <Zap className="w-6 h-6 text-[var(--primary)]" />
                        <span className="font-bold text-gradient">Zenith AI Academy</span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:flex flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Cari pelajaran, materi..."
                                className="input-field pl-10 py-2.5 text-sm"
                            />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--background-card)] transition"
                            >
                                {user.image ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-color)]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={user.image}
                                            alt={user.name || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-medium">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 glass-card py-2 animate-fade-in">
                                    <div className="px-4 py-2 border-b border-[var(--border-color)]">
                                        <p className="font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--background-card)] transition"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        Profil Saya
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--background-card)] transition"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Panel Admin
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-[var(--error)] hover:bg-[var(--background-card)] transition"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Keluar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-[var(--background)]/95 backdrop-blur-lg pt-16">
                    <nav className="p-4 space-y-2">
                        {mobileNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--background-card)] hover:text-[var(--text-primary)] transition"
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {item.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--background-card)] hover:text-[var(--text-primary)] transition"
                            >
                                <Settings className="w-5 h-5 shrink-0" />
                                Panel Admin
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </>
    );
}
