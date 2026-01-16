import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const buttonVariants = {
    base: 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95',
    variants: {
        primary: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 border-none',
        secondary: 'bg-transparent text-white border border-[var(--border-color)] hover:bg-white/5 hover:border-blue-500/40 hover:text-blue-400',
        danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 border-none',
        ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
    },
    sizes: {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-6 py-3 text-base gap-2',
        lg: 'px-8 py-4 text-lg gap-2.5',
    }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={clsx(
                    buttonVariants.base,
                    buttonVariants.variants[variant],
                    buttonVariants.sizes[size],
                    className
                )}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
