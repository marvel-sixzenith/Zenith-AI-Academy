'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Trophy,
    User,
    Settings,
    Zap,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string;
        image?: string | null;
    };
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tracks', label: 'Materi Belajar', icon: BookOpen },
    { href: '/community', label: 'Komunitas', icon: Users },
    { href: '/leaderboard', label: 'Papan Peringkat', icon: Trophy },
    { href: '/profile', label: 'Profil Saya', icon: User },
];

const adminItems = [
    { href: '/admin', label: 'Panel Admin', icon: Settings },
];

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const isAdmin = user.role === 'ADMIN';

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <>
            {/* Mobile overlay */}
            <div className="lg:hidden fixed inset-0 z-40 pointer-events-none">
                {/* Background overlay would go here */}
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full bg-[var(--background-secondary)] border-r border-[var(--border-color)] transition-all duration-300 hidden lg:flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
                    {!isCollapsed && (
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Zap className="w-6 h-6 text-[var(--primary)]" />
                            <span className="font-bold text-gradient">Zenith AI Academy</span>
                        </Link>
                    )}
                    {isCollapsed && (
                        <Link href="/dashboard" className="mx-auto">
                            <Zap className="w-6 h-6 text-[var(--primary)]" />
                        </Link>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-[var(--background-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive
                                    ? 'bg-[var(--primary)]/10 text-[var(--primary-light)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--background-card)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}

                    {/* Admin Section */}
                    {isAdmin && (
                        <>
                            <div className="pt-4 mt-4 border-t border-[var(--border-color)]">
                                {!isCollapsed && (
                                    <span className="px-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                                        Admin
                                    </span>
                                )}
                            </div>
                            {adminItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive
                                            ? 'bg-[var(--primary)]/10 text-[var(--primary-light)]'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--background-card)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5 shrink-0" />
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-[var(--border-color)] relative">
                    <button
                        onClick={() => !isCollapsed && setIsProfileOpen(!isProfileOpen)}
                        className={`w-full flex items-center gap-3 rounded-xl p-2 transition hover:bg-[var(--background-card)] ${isCollapsed ? 'justify-center cursor-default' : 'cursor-pointer'}`}
                    >
                        {user.image ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[var(--border-color)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-medium shrink-0">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1 text-left">
                                <p className="font-medium truncate text-sm">{user.name}</p>
                                <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                            </div>
                        )}
                    </button>

                    {/* Profile Dropdown - Upwards since it's at the bottom */}
                    {!isCollapsed && isProfileOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 glass-card py-2 animate-fade-in shadow-xl z-50">
                            <div className="px-4 py-2 border-b border-[var(--border-color)] mb-1">
                                <p className="font-medium truncate text-sm">{user.name}</p>
                            </div>
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--background-card)] transition text-sm"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                Profil Saya
                            </Link>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--background-card)] transition text-sm"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Settings className="w-4 h-4" />
                                    Panel Admin
                                </Link>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-4 py-2 text-[var(--error)] hover:bg-[var(--background-card)] transition text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
