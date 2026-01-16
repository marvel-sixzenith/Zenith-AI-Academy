import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // Check admin role
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar user={session.user} />
            <div className="flex-1 ml-0 lg:ml-64">
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
