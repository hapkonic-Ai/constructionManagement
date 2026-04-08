import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import NotificationsPanel from '@/components/notifications/NotificationsPanel';

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-4xl">
        <NotificationsPanel />
      </div>
    </main>
  );
}
