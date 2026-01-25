'use client';

import { motion, Variants, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

// Stagger container for coordinating child animations
export function StaggerContainer({
    children,
    className = '',
    staggerDelay = 0.08,
    ...props
}: {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
} & HTMLMotionProps<'div'>) {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: 0.1,
            },
        },
    };

    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Fade up animation for individual items
export function FadeUp({
    children,
    className = '',
    delay = 0,
    duration = 0.4,
    ...props
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
} & HTMLMotionProps<'div'>) {
    const itemVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration,
                ease: 'easeOut' as const,
            },
        },
    };

    return (
        <motion.div
            className={className}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Scale up + fade animation (for modals)
export function ScaleFade({
    children,
    className = '',
    duration = 0.3,
    ...props
}: {
    children: ReactNode;
    className?: string;
    duration?: number;
} & HTMLMotionProps<'div'>) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{
                duration,
                ease: 'easeOut' as const,
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Stagger child item (for use inside StaggerContainer)
export function StaggerItem({
    children,
    className = '',
    ...props
}: {
    children: ReactNode;
    className?: string;
} & HTMLMotionProps<'div'>) {
    const itemVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 16,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.35,
                ease: 'easeOut' as const,
            },
        },
    };

    return (
        <motion.div
            className={className}
            variants={itemVariants}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Backdrop animation for modals
export function Backdrop({
    children,
    className = '',
    onClick,
    ...props
}: {
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
} & HTMLMotionProps<'div'>) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.div>
    );
}
