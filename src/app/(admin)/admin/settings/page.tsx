import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';

async function getSettings() {
    const settings = await prisma.systemSetting.findMany();
    return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {} as Record<string, string>);
}

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        redirect('/dashboard');
    }

    const settings = await getSettings();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
                <p className="text-[var(--text-secondary)]">
                    Configure general platform options and system controls
                </p>
            </div>

            <SettingsForm initialSettings={settings} />
        </div>
    );
}
