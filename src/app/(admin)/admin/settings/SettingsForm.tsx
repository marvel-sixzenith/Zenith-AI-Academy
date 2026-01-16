'use client';

import { useActionState } from 'react';
import { updateSettings } from './actions';
import { Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';

const initialState = {
    success: false,
    message: '',
    error: undefined
};

export default function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
    const [state, formAction, isPending] = useActionState(updateSettings, initialState);

    return (
        <form action={formAction} className="space-y-6">
            {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-2 animate-fade-in">
                    <AlertTriangle className="w-5 h-5" />
                    {state.error}
                </div>
            )}
            {state?.success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg animate-fade-in">
                    {state.message}
                </div>
            )}

            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">General Settings</h2>

                <Input
                    name="siteName"
                    label="Site Name"
                    defaultValue={initialSettings.siteName}
                    placeholder="Zenith AI Academy"
                />

                <Textarea
                    name="siteDescription"
                    label="Site Description"
                    defaultValue={initialSettings.siteDescription}
                    placeholder="Platform description..."
                />

                <Input
                    name="supportEmail"
                    label="Support Email"
                    defaultValue={initialSettings.supportEmail}
                    type="email"
                    placeholder="support@example.com"
                />
            </Card>

            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">System Controls</h2>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold">Maintenance Mode</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Disable access for non-admin users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="maintenanceMode"
                            defaultChecked={initialSettings.maintenanceMode === 'true'}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold">Allow Registrations</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Enable new user sign-ups</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="allowRegistrations"
                            defaultChecked={initialSettings.allowRegistrations === 'true'}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                    </label>
                </div>
            </Card>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isPending}
                    isLoading={isPending}
                >
                    <Save className="w-5 h-5" />
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
