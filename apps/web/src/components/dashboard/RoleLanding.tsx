import Link from 'next/link';
import { LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { signOut } from '@/lib/auth';

type RoleLandingProps = {
  title: string;
  roleLabel: string;
  description: string;
  quickLinks: Array<{ href: string; label: string }>;
};

export default function RoleLanding({ title, roleLabel, description, quickLinks }: RoleLandingProps) {
  async function logoutAction() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{roleLabel}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">{title}</h1>
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/profile/me" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
              Profile
            </Link>
            <Link href="/notifications" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
              Notifications
            </Link>
            <Link href="/settings" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
              Settings
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-rose-800 bg-rose-950/40 px-4 py-2 text-sm font-semibold text-rose-200 hover:border-rose-700 hover:bg-rose-900/40"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm font-semibold hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-600"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
