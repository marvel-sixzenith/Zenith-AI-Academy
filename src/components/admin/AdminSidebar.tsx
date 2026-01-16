'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart3,
    Settings,
    Zap,
    ArrowLeft
} from 'lucide-react';

interface AdminSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string;
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

            {/* User Info */}
            <div className="p-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-medium">
                        {user.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
