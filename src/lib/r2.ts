import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'zenith-assets';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    // Warn but don't crash, as this might run during build time where env vars aren't needed yet
    console.warn('Missing R2 environment variables');
}

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
});

export async function uploadFile(
    file: Buffer | Blob,
    fileName: string,
    contentType: string
): Promise<string> {
    // If input is Blob, convert to Buffer
    let buffer: Buffer;
    if (file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
    } else {
        buffer = file;
    }

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
    });

    try {
        await s3Client.send(command);
        // Return the public URL
        const publicUrl = R2_PUBLIC_URL?.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
        return `${publicUrl}/${fileName}`;
    } catch (error) {
        console.error('Error uploading file to R2:', error);
        throw new Error('Failed to upload file');
    }
}

export async function deleteFile(fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
    });

    try {
        await s3Client.send(command);
    } catch (error) {
        console.error('Error deleting file from R2:', error);
        throw new Error('Failed to delete file');
    }
}

export function getFileUrl(fileName: string): string {
    const publicUrl = R2_PUBLIC_URL?.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
    return `${publicUrl}/${fileName}`;
}
