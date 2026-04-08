'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bell, LogOut, User } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

type RoleNavLink = {
  href: string;
  label: string;
};

type RoleWorkspaceLayoutProps = {
  roleLabel: string;
  navLinks: RoleNavLink[];
  children: React.ReactNode;
};

export default function RoleWorkspaceLayout({ roleLabel, navLinks, children }: RoleWorkspaceLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70 lg:block">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{roleLabel}</p>
          <nav className="mt-4 space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="flex flex-wrap items-center gap-2 lg:hidden">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                      active
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/profile/me"
                className="rounded-lg border border-zinc-300 p-2 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="Profile"
              >
                <User className="h-4 w-4" />
              </Link>
              <Link
                href="/notifications"
                className="rounded-lg border border-zinc-300 p-2 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
