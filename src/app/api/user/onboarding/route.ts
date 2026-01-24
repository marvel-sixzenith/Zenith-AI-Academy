import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update user
        // Set streak to 1 if it's 0 (start the streak)
        // Update user
        // Mark onboarding as complete without modifying streak
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                hasCompletedOnboarding: true
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
