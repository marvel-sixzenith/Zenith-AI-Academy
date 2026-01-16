import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'outline';
}

export const Badge = ({ className, variant = 'primary', ...props }: BadgeProps) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors';

    const variants = {
        primary: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
        success: 'bg-green-500/15 text-green-400 border border-green-500/20',
        warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
        error: 'bg-red-500/15 text-red-400 border border-red-500/20',
        outline: 'bg-transparent text-slate-400 border border-slate-700',
    };

    return (
        <span className={clsx(baseStyles, variants[variant], className)} {...props} />
    );
};
