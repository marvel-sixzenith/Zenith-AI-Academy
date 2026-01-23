'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Zap, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Token tidak valid atau hilang.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password tidak cocok.');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mereset password');
            }

            setIsSuccess(true);
            toast.success('Password berhasil direset!');

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <div className="mb-4 text-[var(--error)]">
                    <AlertCircle className="w-12 h-12 mx-auto" />
                </div>
                <h1 className="text-xl font-bold mb-2">Link Tidak Valid</h1>
                <p className="text-[var(--text-secondary)] mb-6">
                    Tautan reset password ini tidak valid atau sudah kedaluwarsa.
                </p>
                <Link href="/forgot-password" className="btn-primary">
                    Minta Link Baru
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-[var(--success)]" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Password Direset</h1>
                <p className="text-[var(--text-secondary)] mb-8">
                    Password Anda telah berhasil diperbarui. Anda sekarang dapat login dengan password baru.
                </p>
                <Link href="/login" className="btn-primary w-full py-4 inline-flex items-center justify-center">
                    Login Sekarang
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Buat Password Baru</h1>
                <p className="text-[var(--text-secondary)]">
                    Silakan masukkan password baru untuk akun Anda.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                        Password Baru
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field pl-12"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                        Konfirmasi Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field pl-12"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-4"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <Zap className="w-8 h-8 text-[var(--primary)]" />
                    <span className="text-2xl font-bold text-gradient">Zenith AI Academy</span>
                </Link>

                <div className="glass-card p-8">
                    <Suspense fallback={<div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--primary)]" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
