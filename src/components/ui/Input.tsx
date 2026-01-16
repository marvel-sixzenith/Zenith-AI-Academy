import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, startIcon, endIcon, ...props }, ref) => {
        const inputId = id || React.useId();

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-slate-400 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {startIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                            {startIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        className={clsx(
                            "w-full bg-[var(--background-secondary)] border rounded-xl py-3 text-white transition-all duration-300",
                            "focus:outline-none focus:ring-2 placeholder-slate-500",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            startIcon ? "pl-12" : "pl-4",
                            endIcon ? "pr-12" : "pr-4",
                            error
                                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                : "border-[var(--border-color)] focus:border-blue-500 focus:ring-blue-500/20",
                            className
                        )}
                        {...props}
                    />
                    {endIcon && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            {endIcon}
                        </div>
                    )}
                </div>
                {(error || helperText) && (
                    <p className={clsx("text-xs ml-1", error ? "text-red-400" : "text-slate-500")}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
