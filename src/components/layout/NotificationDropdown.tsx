
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, BookOpen, Layers } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    type: 'LESSON' | 'TRACK';
    title: string;
    message: string;
    link: string;
    createdAt: string;
    isNew: boolean;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async () => {
        if (unreadCount === 0) return;

        try {
            await fetch('/api/notifications/mark-read', { method: 'POST' });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
        } catch (error) {
            console.error('Failed to mark notifications as read', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (newState) {
            markAsRead();
        }
    };

    const handleItemClick = (link: string) => {
        setIsOpen(false);
        router.push(link);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="p-1.5 md:p-2 rounded-lg hover:bg-[var(--background-card)] text-[var(--text-secondary)] relative transition-colors"
                aria-label="Notifications"
            >
                <Bell className={clsx("w-4 h-4 md:w-5 md:h-5", isOpen && "text-[var(--primary)]")} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 glass-card bg-[#0B1221] animate-fade-in shadow-xl z-50 border border-[var(--border-color)] overflow-hidden rounded-xl">
                    <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--background-secondary)]/50">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-[var(--primary)] font-medium px-2 py-0.5 rounded-full bg-[var(--primary)]/10">
                                {unreadCount} New
                            </span>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                                Loading...
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-[var(--border-color)]">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleItemClick(n.link)}
                                        className={clsx(
                                            "p-4 cursor-pointer hover:bg-[var(--background-secondary)] transition-colors flex gap-3 items-start",
                                            n.isNew && "bg-[var(--primary)]/5"
                                        )}
                                    >
                                        <div className={clsx(
                                            "p-2 rounded-lg shrink-0 mt-0.5",
                                            n.type === 'TRACK' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {n.type === 'TRACK' ? <Layers className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={clsx("text-sm font-medium leading-none mb-1.5", n.isNew ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-[var(--text-muted)] mt-2 opacity-70">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {n.isNew && (
                                            <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center">
                                <Bell className="w-8 h-8 text-[var(--text-muted)] opacity-20 mb-3" />
                                <p className="text-sm text-[var(--text-muted)]">No new notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
