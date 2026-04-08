import Link from 'next/link';
import { prisma } from '@nexus/db';

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default async function RoleProjectsView({
  roleLabel,
  routeBase,
}: {
  roleLabel: string;
  routeBase: string;
}) {
  const projects: any[] = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      ceo: { select: { name: true } },
      budgets: true,
      _count: {
        select: {
          members: true,
          ganttTasks: true,
          designs: true,
          progressUpdates: true,
          deviations: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{roleLabel}</p>
        <h1 className="mt-1 text-3xl font-black">Project Portfolio</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Live portfolio from Neon DB with team, schedule, design, progress, and budget signals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project: any) => {
          const allocated = project.budgets.reduce((sum: number, item: any) => sum + item.allocated, 0);
          const spent = project.budgets.reduce((sum: number, item: any) => sum + item.spent, 0);
          const utilization = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
          return (
            <Link
              key={project.id}
              href={`${routeBase}/projects/${project.id}`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{project.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{project.location || 'Location not set'}</p>
                </div>
                <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{project.status}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">CEO: {project.ceo.name}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                <p>Members: {project._count.members}</p>
                <p>Tasks: {project._count.ganttTasks}</p>
                <p>Designs: {project._count.designs}</p>
                <p>Updates: {project._count.progressUpdates}</p>
                <p>Deviations: {project._count.deviations}</p>
                <p>Utilization: {utilization}%</p>
              </div>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Budget: {formatMoney(allocated)} • Spent: {formatMoney(spent)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
