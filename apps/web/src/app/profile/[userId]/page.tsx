import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@nexus/db';
import { auth } from '@/lib/auth';
import ProfileEditor from '@/components/profile/ProfileEditor';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;

  if (!sessionUser?.id) {
    redirect('/login');
  }

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      bio: true,
      contact: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const canEdit = sessionUser.id === user.id || sessionUser.role === 'SA' || sessionUser.role === 'CEO';
  const role = sessionUser.role ?? '';
  const dashboardHref =
    role === 'SA' ? '/superadmin' :
    role === 'CEO' ? '/ceo' :
    role === 'CTO' ? '/cto' :
    role === 'CDO' ? '/cdo' :
    role === 'COO' ? '/coo' :
    role === 'CMO' ? '/cmo' :
    role === 'CFO' ? '/cfo' :
    '/';

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Profile</p>
            <h1 className="mt-1 text-3xl font-black">{user.name}</h1>
            <p className="text-zinc-600 dark:text-zinc-400">{user.email} • {user.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={dashboardHref}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/settings"
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <h2 className="mb-4 mt-1 text-xl font-bold">Profile Settings</h2>
          {!canEdit && (
            <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
              Read-only view. Only this user, CEO, or SuperAdmin can edit.
            </p>
          )}
          <ProfileEditor
            userId={user.id}
            initialName={user.name}
            initialAvatarUrl={user.avatarUrl}
            initialBio={user.bio}
            initialContact={user.contact}
            canEdit={canEdit}
          />
        </div>
      </div>
    </main>
  );
}
