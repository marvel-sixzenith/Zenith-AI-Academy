'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateSettings(currentState: any, formData: FormData) {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        return { success: false, error: 'Unauthorized' };
    }

    const settings = {
        siteName: formData.get('siteName') as string,
        siteDescription: formData.get('siteDescription') as string,
        supportEmail: formData.get('supportEmail') as string,
        maintenanceMode: formData.get('maintenanceMode') === 'on' ? 'true' : 'false',
        allowRegistrations: formData.get('allowRegistrations') === 'on' ? 'true' : 'false',
    };

    try {
        await Promise.all(
            Object.entries(settings).map(([key, value]) =>
                prisma.systemSetting.upsert({
                    where: { key },
                    update: { value: value || '' },
                    create: { key, value: value || '' },
                })
            )
        );

        revalidatePath('/admin/settings');
        revalidatePath('/');
        return { success: true, message: 'Settings updated successfully' };
    } catch (error) {
        console.error('Failed to update settings:', error);
        return { success: false, error: 'Failed to update settings' };
    }
}
