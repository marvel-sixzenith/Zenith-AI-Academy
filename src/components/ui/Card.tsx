import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'glass' | 'solid' | 'outline';
    hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'glass', hoverEffect = false, children, ...props }, ref) => {
        const baseStyles = 'rounded-2xl transition-all duration-300 border overflow-hidden';

        const variants = {
            glass: 'bg-[var(--background-card)] backdrop-blur-xl border-[var(--border-color)]',
            solid: 'bg-[#1e293b] border-slate-700',
            outline: 'bg-transparent border-slate-700',
        };

        const hoverStyles = hoverEffect
            ? 'hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group'
            : '';

        return (
            <div
                ref={ref}
                className={clsx(baseStyles, variants[variant], hoverStyles, className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("p-6 border-b border-[var(--border-color)]", className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={clsx("text-lg font-semibold text-white", className)} {...props}>
        {children}
    </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={clsx("text-sm text-slate-400 mt-1", className)} {...props}>
        {children}
    </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("p-6", className)} {...props}>
        {children}
    </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("p-6 pt-0 flex items-center", className)} {...props}>
        {children}
    </div>
);
