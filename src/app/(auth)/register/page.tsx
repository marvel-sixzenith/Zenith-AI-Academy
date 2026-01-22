'use client';


import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        const nameParam = searchParams.get('name');
        const errorParam = searchParams.get('error');

        if (errorParam === 'AccountNotRegistered') {
            setError('Akun Google ini belum terdaftar. Silakan lanjutkan pendaftaran di bawah.');
        }

        if (emailParam || nameParam) {
            setFormData(prev => ({
                ...prev,
                email: emailParam || prev.email,
                name: nameParam || prev.name
            }));
        }
    }, [searchParams]);

    // Fix for stuck loading state when navigating back involves BFCache
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                setIsLoading(false);
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password minimal 8 karakter');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Pendaftaran gagal');
            }

            // Redirect to login on success
            router.push('/login?registered=true');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            document.cookie = "auth_intent=register; path=/; max-age=300"; // 5 minutes
            await import('next-auth/react').then(mod => mod.signIn('google', {
                callbackUrl: '/dashboard',
                redirect: true,
            }));
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-6">
                    <Zap className="w-8 h-8 text-[var(--primary)]" />
                    <span className="text-2xl font-bold text-gradient">Zenith AI Academy</span>
                </Link>

                {/* Register Card */}
                <Card className="p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold mb-1">Buat Akun Anda</h1>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Mulai perjalanan Anda menuju penguasaan AI
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-11 flex items-center justify-center gap-3 bg-white text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {/* Google Logo */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Daftar dengan Google
                    </button>

                    <div className="mb-4 flex items-center gap-4">
                        <div className="flex-1 h-px bg-[var(--border-color)]" />
                        <span className="text-xs text-[var(--text-muted)] uppercase">atau email</span>
                        <div className="flex-1 h-px bg-[var(--border-color)]" />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            label="Nama Lengkap"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            startIcon={<User className="w-5 h-5" />}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="nama@email.com"
                                required
                                startIcon={<Mail className="w-5 h-5" />}
                            />

                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                label="No. Telepon"
                                helperText="(Opsional)"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+62..."
                                startIcon={<Phone className="w-5 h-5" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    label="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
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

                            <div className="space-y-1.5">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    label="Konfirmasi" // Shortened for layout
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    startIcon={<Lock className="w-5 h-5" />}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full py-3 mt-2 text-white"
                        >
                            Buat Akun
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-[var(--primary-light)] hover:text-[var(--primary)] font-medium transition">
                            Masuk
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
