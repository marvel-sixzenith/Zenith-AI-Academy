import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTracks } from '@/lib/tracks';

// GET /api/tracks - Get all tracks with user progress
export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const tracksWithProgress = await getTracks(userId);

        return NextResponse.json({ tracks: tracksWithProgress });
    } catch (error) {
        console.error('Error fetching tracks:', error);
        return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
    }
}
