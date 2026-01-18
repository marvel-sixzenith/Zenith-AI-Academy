
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFile } from '@/lib/r2';

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate (Admin only)
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const folder = formData.get('folder') as string || 'content';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 3. Upload to R2
        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename: remove special chars, spaces -> dashes
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
        const fileName = `${folder}/${Date.now()}-${cleanName}`;

        const fileUrl = await uploadFile(buffer, fileName, file.type);

        return NextResponse.json({
            success: true,
            url: fileUrl
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
