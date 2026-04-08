import { redirect } from 'next/navigation';
import { prisma } from '@nexus/db';
import { auth } from '@/lib/auth';

function formatDate(value: Date | null) {
  if (!value) return 'Not released';
  return new Date(value).toLocaleDateString();
}

export default async function CDOPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [designs, projects] = await Promise.all([
    prisma.design.findMany({
      orderBy: [{ projectId: 'asc' }, { order: 'asc' }],
      include: {
        project: { select: { title: true } },
        timeline: true,
      },
    }),
    prisma.project.findMany({
      select: { id: true, title: true, status: true, _count: { select: { designs: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const releasedCount = designs.filter((design) => design.status === 'RELEASED').length;
  const readyCount = designs.filter((design) => design.status === 'READY').length;
  const draftCount = designs.filter((design) => design.status === 'DRAFT').length;
  const avgEta = designs.reduce((sum, design) => sum + (design.timeline?.estimatedDays ?? 0), 0);
  const etaBase = designs.filter((design) => design.timeline?.estimatedDays).length;

  return (
    <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">CDO</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Design Operations Center</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Design packages, release cadence, and delivery timelines from Neon-backed records.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Design Packages</p>
            <p className="mt-1 text-2xl font-black">{designs.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Released</p>
            <p className="mt-1 text-2xl font-black">{releasedCount}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Ready / Draft</p>
            <p className="mt-1 text-2xl font-black">{readyCount} / {draftCount}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg ETA</p>
            <p className="mt-1 text-2xl font-black">{etaBase ? Math.round(avgEta / etaBase) : 0} days</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">Design Delivery Stream</h2>
            <div className="mt-4 space-y-3">
              {designs.length === 0 && <p className="text-sm text-zinc-500">No design packages available.</p>}
              {designs.slice(0, 12).map((design) => (
                <div key={design.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{design.title}</p>
                    <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{design.status}</span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">{design.project.title}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Order {design.order}
                    {design.timeline ? ` • ETA ${design.timeline.estimatedDays} days` : ''}
                    {' • '}Released: {formatDate(design.releasedAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">Project Design Coverage</h2>
            <div className="mt-4 space-y-3">
              {projects.length === 0 && <p className="text-sm text-zinc-500">No projects available.</p>}
              {projects.map((project) => (
                <div key={project.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{project.title}</p>
                    <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{project.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Design packages: {project._count.designs}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
    </div>
  );
}
