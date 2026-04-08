'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Users,
  History,
  Settings,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

const sidebarLinks = [
  { href: '/ceo', label: 'Overview', icon: LayoutDashboard },
  { href: '/ceo/projects', label: 'Projects', icon: Briefcase },
  { href: '/ceo/gantt', label: 'Gantt Chart', icon: BarChart3 },
  { href: '/ceo/people', label: 'People', icon: Users },
  { href: '/ceo/audit', label: 'Audit Logs', icon: History },
];

export default function CEOLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <div className="h-5 w-5 rounded-sm border-2 border-current transform rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Nexus
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-10 flex-1 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-zinc-900 shadow-lg shadow-zinc-200 dark:bg-zinc-50 dark:shadow-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  <Icon
                    className={`relative z-10 h-5 w-5 transition-colors ${
                      isActive
                        ? 'text-white dark:text-zinc-900'
                        : 'text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100'
                    }`}
                  />
                  <span
                    className={`relative z-10 transition-colors ${
                      isActive
                        ? 'text-white dark:text-zinc-900'
                        : 'text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100'
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="mt-auto space-y-4 pt-10">
            <Link
              href="/ceo/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
            
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                  <UserIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <Link href="/profile/me" className="truncate text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-50">
                  Alex Stratos
                </Link>
                <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">CEO & Founder</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-72">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-zinc-200 bg-white/50 px-8 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span>Nexus</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
              {pathname === '/ceo' ? 'Overview' : pathname.split('/').filter(Boolean).pop()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="h-10 w-64 rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
              />
            </div>

            <Link
              href="/profile/me"
              className="rounded-xl border border-zinc-200 p-2.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Profile"
            >
              <UserIcon className="h-5 w-5" />
            </Link>

            <Link
              href="/ceo/notifications"
              className="relative rounded-xl border border-zinc-200 p-2.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-950" />
            </Link>

            <ThemeToggle />
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
