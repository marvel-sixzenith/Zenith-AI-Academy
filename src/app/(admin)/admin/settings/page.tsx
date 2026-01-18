import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';
import { AvatarUpload } from '@/components/user/AvatarUpload';

async function getSettings() {
    const settings = await prisma.systemSetting.findMany();
    return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {} as Record<string, string>);
}

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const settings = await getSettings();

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
                <p className="text-[var(--text-secondary)]">
                    Configure general platform options and system controls
                </p>
            </div>

            {/* Admin Profile */}
            <div className="bg-[var(--background-card)] border border-[var(--border-color)] rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Admin Profile</h2>
                <div className="flex items-center gap-6">
                    <AvatarUpload currentImage={user?.image} userName={user?.name || 'Admin'} />
                    <div>
                        <p className="font-bold text-lg">{user?.name}</p>
                        <p className="text-[var(--text-muted)]">{user?.email}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded-md font-medium">
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>

            <SettingsForm initialSettings={settings} />
        </div>
    );
}
