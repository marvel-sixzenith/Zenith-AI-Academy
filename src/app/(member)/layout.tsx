import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

export default async function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar user={session.user} />
            <div className="flex-1 flex flex-col ml-0 lg:ml-64">
                <TopNav user={session.user} />
                <main className="flex-1 p-6 pt-20 lg:pt-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
