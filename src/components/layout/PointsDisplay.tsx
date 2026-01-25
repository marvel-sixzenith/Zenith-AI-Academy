'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getUserPoints } from '@/actions/user';

export default function PointsDisplay() {
    const [points, setPoints] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchPoints = async () => {
            const latestPoints = await getUserPoints();
            setPoints(latestPoints);
        };

        fetchPoints();
    }, []);

    if (!mounted || points === null) return null;

    return (
        <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 bg-[var(--warning)]/10 text-[var(--warning)] rounded-full border border-[var(--warning)]/20">
            <Trophy className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="font-bold text-[10px] md:text-xs leading-none">
                {points}
                <span className="hidden sm:inline"> XP</span>
            </span>
        </div>
    );
}
