
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFile } from '@/lib/r2';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Configure payload limit for images (e.g. 5MB) is handled by Next.js config generally, 
// but we just handle the stream here.

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate User
        const session = await auth();

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // 2. Parsed Form Data
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 3. Validation
        // Check file type (must be image)
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Check file size (e.g. max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        // 4. Upload to R2
        const buffer = Buffer.from(await file.arrayBuffer());
        // Generate a unique filename: avatars/userId-timestamp.ext
        const ext = file.name.split('.').pop() || 'png';
        const fileName = `avatars/${userId}-${Date.now()}.${ext}`;

        const fileUrl = await uploadFile(buffer, fileName, file.type);

        // 5. Update Database (Supabase via Prisma)
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { image: fileUrl },
            select: { image: true, name: true }
        });

        return NextResponse.json({
            success: true,
            url: fileUrl,
            user: updatedUser
        });

    } catch (error) {
        console.error('Avatar upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
