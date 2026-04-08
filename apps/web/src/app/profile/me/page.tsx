import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function MyProfileRedirectPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/login');
  }

  redirect(`/profile/${userId}`);
}
