import { redirect } from 'next/navigation';
import { prisma } from '@nexus/db';
import { auth } from '@/lib/auth';

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString();
}

export default async function CTOPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [projects, tasks, designs]: [any[], any[], any[]] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        _count: { select: { ganttTasks: true, designs: true, deviations: true } },
      },
    }),
    prisma.ganttTask.findMany({
      orderBy: { startDate: 'asc' },
      take: 10,
      include: { project: { select: { title: true } } },
    }),
    prisma.design.findMany({
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
      take: 10,
      include: { project: { select: { title: true } }, timeline: true },
      where: { status: { in: ['DRAFT', 'READY'] } },
    }),
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task: any) => task.progress >= 100).length;
  const delayedProjects = projects.filter((project: any) => project.status.toUpperCase().includes('DELAY')).length;

  return (
    <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">CTO</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Technical Command Center</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Engineering timeline, technical dependencies, and design-release readiness from Neon DB.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Active Projects</p>
            <p className="mt-1 text-2xl font-black">{projects.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Tracked Tasks</p>
            <p className="mt-1 text-2xl font-black">{totalTasks}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Completed Tasks</p>
            <p className="mt-1 text-2xl font-black">{completedTasks}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Delayed Projects</p>
            <p className="mt-1 text-2xl font-black">{delayedProjects}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">Upcoming Technical Milestones</h2>
            <div className="mt-4 space-y-3">
              {tasks.length === 0 && <p className="text-sm text-zinc-500">No technical milestones yet.</p>}
              {tasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{task.project.title}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(task.startDate)} - {formatDate(task.endDate)} • {Math.round(task.progress)}%
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">Design Release Queue</h2>
            <div className="mt-4 space-y-3">
              {designs.length === 0 && <p className="text-sm text-zinc-500">No draft or ready design packages.</p>}
              {designs.map((design) => (
                <div key={design.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{design.title}</p>
                    <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{design.status}</span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">{design.project.title}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Sequence {design.order}
                    {design.timeline ? ` • ETA ${design.timeline.estimatedDays} days` : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
    </div>
  );
}
