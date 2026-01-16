'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Gagal mengirim email reset');
            }

            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <Zap className="w-8 h-8 text-[var(--primary)]" />
                    <span className="text-2xl font-bold text-gradient">Zenith AI Academy</span>
                </Link>

                {/* Card */}
                <div className="glass-card p-8">
                    {isSubmitted ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-[var(--success)]" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Cek Email Anda</h1>
                            <p className="text-[var(--text-secondary)] mb-8">
                                Kami telah mengirimkan tautan reset password ke <strong>{email}</strong>.
                                Silakan cek kotak masuk Anda dan ikuti instruksinya.
                            </p>
                            <Link href="/login" className="btn-primary w-full py-4 inline-flex items-center justify-center">
                                Kembali ke Login
                            </Link>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold mb-2">Reset Password Anda</h1>
                                <p className="text-[var(--text-secondary)]">
                                    Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mereset password Anda.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                                        Alamat Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input-field pl-12"
                                            placeholder="nama@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full py-4"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        'Kirim Tautan Reset'
                                    )}
                                </button>
                            </form>

                            {/* Back to Login */}
                            <Link
                                href="/login"
                                className="mt-8 flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Kembali ke Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
