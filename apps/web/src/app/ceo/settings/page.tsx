import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function CEOSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Settings</h1>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Appearance</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Switch between light and dark mode.</p>
        <div className="mt-4"><ThemeToggle /></div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Account</h2>
        <div className="mt-4 flex gap-3">
          <Link href="/profile/me" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            Open Profile
          </Link>
          <Link href="/ceo/notifications" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
            Open Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
