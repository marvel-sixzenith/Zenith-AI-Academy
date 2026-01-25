import { auth } from '@/lib/auth';
import LandingPageContent from '@/components/home/LandingPageContent';

export default async function HomePage() {
  const session = await auth();

  return <LandingPageContent user={session?.user} />;
}
