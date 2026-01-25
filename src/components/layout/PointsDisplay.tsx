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

    if (!mounted || points === null) return null; // Loading state (invisible)

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--warning)]/10 text-[var(--warning)] rounded-full border border-[var(--warning)]/20">
            <Trophy className="w-4 h-4" />
            <span className="font-bold text-sm">{points} XP</span>
        </div>
    );
}
