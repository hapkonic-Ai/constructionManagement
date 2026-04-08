import { redirect } from 'next/navigation';
import { prisma } from '@nexus/db';
import { auth } from '@/lib/auth';

function formatDate(value: Date) {
  return new Date(value).toLocaleString();
}

export default async function COOPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [projects, updates, deviations] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true },
    }),
    prisma.progressUpdate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        project: { select: { title: true } },
        coo: { select: { name: true } },
      },
    }),
    prisma.deviation.findMany({
      orderBy: { approvedAt: 'asc' },
      take: 12,
      include: {
        project: { select: { title: true } },
        coo: { select: { name: true } },
      },
    }),
  ]);

  const weeklyUpdates = updates.filter((item) => item.createdAt >= weekAgo).length;
  const pendingDeviations = deviations.filter((item) => !item.approvedAt).length;
  const approvedDeviations = deviations.filter((item) => !!item.approvedAt).length;

  return (
    <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">COO</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Operations Control Center</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Execution updates, field deviations, and operational risk visibility from live DB records.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Active Projects</p>
            <p className="mt-1 text-2xl font-black">{projects.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Updates (7 Days)</p>
            <p className="mt-1 text-2xl font-black">{weeklyUpdates}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Pending Deviations</p>
            <p className="mt-1 text-2xl font-black">{pendingDeviations}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Approved Deviations</p>
            <p className="mt-1 text-2xl font-black">{approvedDeviations}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">Recent Progress Updates</h2>
            <div className="mt-4 space-y-3">
              {updates.length === 0 && <p className="text-sm text-zinc-500">No progress updates available.</p>}
              {updates.map((update) => (
                <div key={update.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <p className="font-semibold">{update.project.title}</p>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300">{update.note}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{update.coo.name} • {formatDate(update.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">Deviation Queue</h2>
            <div className="mt-4 space-y-3">
              {deviations.length === 0 && <p className="text-sm text-zinc-500">No deviations logged.</p>}
              {deviations.map((deviation) => (
                <div key={deviation.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{deviation.project.title}</p>
                    <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">
                      {deviation.approvedAt ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300">{deviation.type} • {deviation.reason}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Delta {deviation.delta} • Raised by {deviation.coo.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
    </div>
  );
}
