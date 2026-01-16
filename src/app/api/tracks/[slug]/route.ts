import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTrackBySlug } from '@/lib/tracks';

// GET /api/tracks/[slug] - Get track details with modules and lessons
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const { slug } = await params;
        const track = await getTrackBySlug(slug, userId);

        if (!track) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        return NextResponse.json({ track });
    } catch (error) {
        console.error('Error fetching track:', error);
        return NextResponse.json({ error: 'Failed to fetch track' }, { status: 500 });
    }
}
