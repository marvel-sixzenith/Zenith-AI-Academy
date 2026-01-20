"use client";

import { useState } from 'react';
import { Mail, Ban, CheckCircle, ShieldAlert } from 'lucide-react';
import { toggleBanUser } from '@/app/actions/admin';
import { toast } from 'react-hot-toast';

interface UserActionButtonsProps {
    userId: string;
    email: string;
    isBanned: boolean;
}

export default function UserActionButtons({ userId, email, isBanned: initialBannedStatus }: UserActionButtonsProps) {
    const [isBanned, setIsBanned] = useState(initialBannedStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleBanToggle = async () => {
        if (!confirm(`Are you sure you want to ${isBanned ? 'unban' : 'ban'} this user?`)) return;

        setIsLoading(true);
        try {
            const result = await toggleBanUser(userId);
            if (result.success && result.isBanned !== undefined) {
                setIsBanned(result.isBanned);
                toast.success(result.isBanned ? 'User has been banned.' : 'User has been unbanned.');
            } else {
                toast.error(result.error || 'Failed to update user status');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 flex justify-center gap-3">
            <a
                href={`mailto:${email}`}
                className="p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-secondary)]/80 transition text-[var(--text-primary)]"
                title="Email User"
            >
                <Mail className="w-4 h-4" />
            </a>

            <button
                onClick={handleBanToggle}
                disabled={isLoading}
                className={`p-2 rounded-lg transition ${isBanned
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                title={isBanned ? "Unban User" : "Ban User"}
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isBanned ? (
                    <CheckCircle className="w-4 h-4" />
                ) : (
                    <Ban className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}
