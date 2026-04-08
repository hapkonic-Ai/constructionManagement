import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-black">Settings</h1>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 className="text-lg font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Switch between light and dark mode.</p>
          <div className="mt-4"><ThemeToggle /></div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 className="text-lg font-semibold">Account</h2>
          <div className="mt-4 flex gap-3">
            <Link href="/profile/me" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">Profile</Link>
            <Link href="/notifications" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-600">Notifications</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
