'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
    const router = useRouter();
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

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <Zap className="w-8 h-8 text-[var(--primary)]" />
                    <span className="text-2xl font-bold text-gradient">Zenith AI Academy</span>
                </Link>

                {/* Register Card */}
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Buat Akun Anda</h1>
                        <p className="text-[var(--text-secondary)]">
                            Mulai perjalanan Anda menuju penguasaan AI
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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

                        <Input
                            id="email"
                            name="email"
                            type="email"
                            label="Alamat Email"
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
                            label="Nomor Telepon"
                            helperText="(Opsional)"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+62 812 3456 7890"
                            startIcon={<Phone className="w-5 h-5" />}
                        />

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
                                helperText="Minimal 8 karakter"
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
                                label="Konfirmasi Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                startIcon={<Lock className="w-5 h-5" />}
                            />
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full py-4 text-white"
                        >
                            Buat Akun
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-[var(--border-color)]" />
                        <span className="text-sm text-[var(--text-muted)]">atau</span>
                        <div className="flex-1 h-px bg-[var(--border-color)]" />
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-[var(--text-secondary)]">
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
