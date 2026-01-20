import { auth } from '@/lib/auth';
import { getPresignedUploadUrl } from '@/lib/r2';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { fileName, contentType } = await req.json();

        if (!fileName || !contentType) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Generate a unique filename to prevent collisions
        const timestamp = Date.now();
        const uniqueFileName = `${session.user.id}-${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const { uploadUrl, fileUrl } = await getPresignedUploadUrl(uniqueFileName, contentType);

        return NextResponse.json({
            uploadUrl,
            fileUrl,
            fileName: uniqueFileName
        });

    } catch (error) {
        console.error('[UPLOAD_PRESIGNED]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
