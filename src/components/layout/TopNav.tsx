'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
    Menu,
    X,
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
import PointsDisplay from './PointsDisplay';
import { useMobileMenu } from './MobileMenuContext';
import { useState } from 'react';

interface TopNavProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string;
        image?: string | null;
    };
}

const mobileNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, id: 'mobile-nav-dashboard' },
    { href: '/tracks', label: 'Materi Belajar', icon: BookOpen, id: 'mobile-nav-tracks' },
    { href: '/community', label: 'Komunitas', icon: Users, id: 'mobile-nav-community' },
    { href: '/leaderboard', label: 'Papan Peringkat', icon: Trophy, id: 'mobile-nav-leaderboard' },
    { href: '/profile', label: 'Profil Saya', icon: User, id: 'mobile-nav-profile' },
];

export default function TopNav({ user }: TopNavProps) {
    const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <>
            {/* Top Navigation Bar - Compact on Mobile */}
            <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 h-14 md:h-16 bg-[var(--background-secondary)]/90 backdrop-blur-lg border-b border-[var(--border-color)]">
                <div className="h-full px-2 md:px-4 flex items-center justify-between gap-2">
                    {/* Left: Menu + Logo */}
                    <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                        {/* Mobile Menu Button */}
                        <button
                            id="mobile-menu-toggle"
                            onClick={toggleMobileMenu}
                            className="lg:hidden p-1.5 md:p-2 rounded-lg hover:bg-[var(--background-card)] text-[var(--text-secondary)]"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Mobile Logo - Shorter */}
                        <Link href="/dashboard" className="lg:hidden flex items-center gap-1.5">
                            <Zap className="w-5 h-5 text-[var(--primary)]" />
                            <span className="font-bold text-sm text-gradient">Zenith AI</span>
                        </Link>
                    </div>

                    {/* Search Bar - Desktop Only */}
                    <div className="hidden lg:flex flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Cari pelajaran, materi..."
                                className="input-field pl-10 py-2 text-sm"
                            />
                        </div>
                    </div>

                    {/* Right Section - Compact */}
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                        {/* Points - Compact on mobile */}
                        <PointsDisplay />

                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* Profile Avatar - Smaller on mobile */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center p-1 rounded-lg hover:bg-[var(--background-card)] transition"
                            >
                                {user.image ? (
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border border-[var(--border-color)]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={user.image}
                                            alt={user.name || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-medium text-xs md:text-sm">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 md:w-56 glass-card py-2 animate-fade-in z-50">
                                    <div className="px-3 md:px-4 py-2 border-b border-[var(--border-color)]">
                                        <p className="font-medium text-sm truncate">{user.name}</p>
                                        <p className="text-[10px] md:text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--background-card)] transition"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        Profil Saya
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--background-card)] transition"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Panel Admin
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-3 md:px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-card)] transition"
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

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-[var(--background)]/95 backdrop-blur-lg pt-14">
                    <nav className="p-3 space-y-1">
                        {mobileNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                id={item.id}
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--background-card)] hover:text-[var(--text-primary)] transition"
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {item.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                id="mobile-nav-admin"
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--background-card)] hover:text-[var(--text-primary)] transition"
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
