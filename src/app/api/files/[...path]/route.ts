import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/r2';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const filePath = path.join('/');

        if (!filePath) {
            return NextResponse.json({ error: 'File path required' }, { status: 400 });
        }

        const file = await getFile(filePath);

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Convert Buffer to Uint8Array for NextResponse compatibility
        const uint8Array = new Uint8Array(file.buffer);

        // Return the file with appropriate headers
        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                'Content-Type': file.contentType,
                'Content-Length': String(file.buffer.length),
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
