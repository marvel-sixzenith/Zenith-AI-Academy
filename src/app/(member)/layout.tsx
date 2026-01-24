import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import OnboardingTour from '@/components/onboarding/OnboardingTour';

export default async function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    if ((session.user as any).banned) {
        redirect('/banned');
    }

    return (
        <div className="flex min-h-screen">
            <OnboardingTour user={session.user} />
            <Sidebar user={session.user} />
            <div className="flex-1 flex flex-col ml-0 lg:ml-64">
                <TopNav user={session.user} />
                <main className="flex-1 p-6 pt-24">
                    {children}
                </main>
            </div>
        </div>
    );
}
