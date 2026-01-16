'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Email atau password tidak valid');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('Terjadi kesalahan. Silakan coba lagi.');
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

                {/* Login Card */}
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Selamat Datang Kembali</h1>
                        <p className="text-[var(--text-secondary)]">
                            Masuk untuk melanjutkan perjalanan belajar Anda
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            id="email"
                            type="email"
                            label="Alamat Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@email.com"
                            required
                            startIcon={<Mail className="w-5 h-5" />}
                        />

                        <div className="space-y-1.5">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                startIcon={<Lock className="w-5 h-5" />}
                                endIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="hover:text-[var(--text-primary)] transition focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                }
                            />
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-[var(--primary-light)] hover:text-[var(--primary)] transition"
                            >
                                Lupa password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full py-4 text-white"
                        >
                            Masuk
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-[var(--border-color)]" />
                        <span className="text-sm text-[var(--text-muted)]">atau</span>
                        <div className="flex-1 h-px bg-[var(--border-color)]" />
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-[var(--text-secondary)]">
                        Belum punya akun?{' '}
                        <Link href="/register" className="text-[var(--primary-light)] hover:text-[var(--primary)] font-medium transition">
                            Buat akun
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}
