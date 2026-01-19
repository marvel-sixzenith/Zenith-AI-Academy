
'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, User as UserIcon, X, Upload, Trash2, Crop as CropIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/canvasUtils';
import { Button } from '@/components/ui/Button';

interface AvatarUploadProps {
    currentImage?: string | null;
    userName: string;
}

export function AvatarUpload({ currentImage, userName }: AvatarUploadProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // UI State
    const [showMenu, setShowMenu] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Crop State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be smaller than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                setShowCropModal(true);
                setShowMenu(false); // Close menu
                // Reset crop state
                setZoom(1);
                setCrop({ x: 0, y: 0 });
            });
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input
        }
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSaveCrop = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setIsUploading(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedImageBlob) throw new Error('Failed to crop image');

            const formData = new FormData();
            // Convert blob to file
            const file = new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' });
            formData.append('file', file);

            const res = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            router.refresh();
            setShowCropModal(false);
            setImageSrc(null);
        } catch (error) {
            console.error(error);
            alert('Failed to upload avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to remove your profile picture?')) return;

        setIsDeleting(true);
        try {
            const res = await fetch('/api/user/avatar', {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Delete failed');
            router.refresh();
            setShowMenu(false);
        } catch (error) {
            console.error(error);
            alert('Failed to delete avatar');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative z-10">
            {/* Avatar Circle */}
            <div
                className="relative group w-32 h-32 mx-auto cursor-pointer"
                onClick={() => setShowMenu(!showMenu)}
            >
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--background)] shadow-xl bg-[var(--card)] transition-transform hover:scale-105">
                    {currentImage ? (
                        <Image
                            src={currentImage}
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
                    {(isUploading || isDeleting) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
                <div ref={menuRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[var(--card)] border border-[var(--border-color)] rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-20">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors text-left"
                    >
                        <Upload className="w-4 h-4" />
                        Ubah Foto
                    </button>
                    {currentImage && (
                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-colors text-left text-[var(--error)]"
                        >
                            <Trash2 className="w-4 h-4" />
                            Hapus Foto
                        </button>
                    )}
                </div>
            )}

            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
            />

            {/* Crop Modal */}
            {showCropModal && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-[var(--card)] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <CropIcon className="w-5 h-5" />
                                Sesuaikan Foto
                            </h3>
                            <button onClick={() => setShowCropModal(false)} className="hover:text-[var(--error)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative h-80 bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                            />
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[var(--text-secondary)]">Zoom</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full accent-[var(--primary)] h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowCropModal(false)}
                                    disabled={isUploading}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleSaveCrop}
                                    isLoading={isUploading}
                                >
                                    Simpan Foto
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
