
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

console.log('--- R2 Configuration Check ---');
console.log('Account ID:', R2_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
console.log('Access Key:', R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('Secret Key:', R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
console.log('Bucket Name:', R2_BUCKET_NAME);
console.log('Public URL:', R2_PUBLIC_URL);
console.log('------------------------------');

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('❌ Missing credentials. Cannot proceed.');
    process.exit(1);
}

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

async function testUpload() {
    const fileName = 'test-connection.txt';
    const content = 'Hello from Zenith AI Academy! If you see this, R2 integration is working.';

    console.log(`\nAttempting to upload "${fileName}" to bucket "${R2_BUCKET_NAME}"...`);

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: content,
        ContentType: 'text/plain',
    });

    try {
        await s3Client.send(command);
        console.log('✅ Upload SUCCESSFUL!');

        const publicUrl = R2_PUBLIC_URL?.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
        const fullUrl = `${publicUrl}/${fileName}`;

        console.log('\nYou should be able to access the file here:');
        console.log(`👉 ${fullUrl}`);
        console.log('\n(Note: If the link 404s, wait a few seconds or check if Public Access is fully enabled/propagated).');

    } catch (error) {
        console.error('❌ Upload FAILED:', error);
    }
}

testUpload();
