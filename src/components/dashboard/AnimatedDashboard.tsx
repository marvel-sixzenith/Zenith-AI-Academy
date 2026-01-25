'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedDashboardProps {
    children: ReactNode;
    className?: string;
}

// Container variants for staggering children
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

// Item variants for fade-up animation
const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut' as const,
        },
    },
};

// Main dashboard container with stagger animation
export function AnimatedDashboard({ children, className = '' }: AnimatedDashboardProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {children}
        </motion.div>
    );
}

// Individual animated item (use inside AnimatedDashboard)
export function AnimatedItem({
    children,
    className = ''
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div className={className} variants={itemVariants}>
            {children}
        </motion.div>
    );
}

// Animated card for stats/widgets
export function AnimatedCard({
    children,
    className = ''
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            variants={itemVariants}
            whileHover={{
                y: -2,
                transition: { duration: 0.2 }
            }}
        >
            {children}
        </motion.div>
    );
}

// Grid container that staggers its children
export function AnimatedGrid({
    children,
    className = ''
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            variants={containerVariants}
        >
            {children}
        </motion.div>
    );
}
