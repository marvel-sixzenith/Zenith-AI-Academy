
'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
    currentImage?: string | null;
    userName: string;
}

export function AvatarUpload({ currentImage, userName }: AvatarUploadProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('Image must be smaller than 5MB');
            return;
        }

        // Optimistic Preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();

            // Success
            router.refresh();
            alert('Avatar updated successfully!');

        } catch (error) {
            console.error(error);
            alert('Failed to upload avatar');
            setPreview(currentImage || null); // Revert
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative group w-32 h-32 mx-auto">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--background)] shadow-xl bg-[var(--card)]">
                {preview ? (
                    <Image
                        src={preview}
                        alt={userName}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400">
                        <UserIcon className="w-12 h-12" />
                    </div>
                )}

                {/* Loading Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 transition-all">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}

                {/* Hover Overlay */}
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                    <Camera className="w-8 h-8 text-white" />
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
            />
        </div>
    );
}
