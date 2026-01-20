'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart3,
    Settings,
    Zap,
    ArrowLeft,
    LogOut,
    User
} from 'lucide-react';

interface AdminSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string;
        image?: string | null;
    };
}

const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/content', label: 'Content Management', icon: BookOpen },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-[var(--background-secondary)] border-r border-[var(--border-color)] hidden lg:flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
                <Link href="/admin" className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-[var(--primary)]" />
                    <span className="font-bold">
                        <span className="text-gradient">Admin</span>
                    </span>
                </Link>
            </div>

            {/* Back to App */}
            <div className="p-4 border-b border-[var(--border-color)]">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--background-card)] hover:text-[var(--text-primary)] transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to App
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

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
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Info with Dropdown */}
            <div className="p-4 border-t border-[var(--border-color)] relative" ref={profileRef}>
                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-full flex items-center gap-3 rounded-xl p-2 transition hover:bg-[var(--background-card)] cursor-pointer"
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
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-medium">
                            {user.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    )}
                    <div className="min-w-0 text-left flex-1">
                        <p className="font-medium truncate text-sm">{user.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user.role}</p>
                    </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl py-2 animate-in fade-in zoom-in-95 duration-200 shadow-xl z-50">
                        <div className="px-4 py-2 border-b border-[var(--border-color)] mb-1">
                            <p className="font-medium truncate text-sm">{user.name}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                        </div>
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--background-secondary)] transition text-sm"
                            onClick={() => setIsProfileOpen(false)}
                        >
                            <User className="w-4 h-4" />
                            My Profile
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-[var(--error)] hover:bg-[var(--background-secondary)] transition text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
