import React from 'react';
import clsx from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const textareaId = id || React.useId();

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={textareaId} className="block text-sm font-medium text-slate-400 ml-1">
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    ref={ref}
                    className={clsx(
                        "w-full bg-[var(--background-secondary)] border rounded-xl px-4 py-3 text-white transition-all duration-300 min-h-[100px]",
                        "focus:outline-none focus:ring-2 placeholder-slate-500",
                        "disabled:opacity-50 disabled:cursor-not-allowed resize-y",
                        error
                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                            : "border-[var(--border-color)] focus:border-blue-500 focus:ring-blue-500/20",
                        className
                    )}
                    {...props}
                />
                {(error || helperText) && (
                    <p className={clsx("text-xs ml-1", error ? "text-red-400" : "text-slate-500")}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
