import { redirect } from 'next/navigation';
import { prisma } from '@nexus/db';
import { auth } from '@/lib/auth';

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default async function CFOPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [budgets, deviations, projects] = await Promise.all([
    prisma.budgetAllocation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { project: { select: { id: true, title: true } } },
    }),
    prisma.deviation.findMany({
      where: { type: 'COST' },
      orderBy: { approvedAt: 'asc' },
      take: 12,
      include: { project: { select: { title: true } } },
    }),
    prisma.project.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalAllocated = budgets.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const utilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const pendingCostDeviations = deviations.filter((item) => !item.approvedAt).length;

  const budgetByProject = projects.map((project) => {
    const projectBudgets = budgets.filter((budget) => budget.projectId === project.id);
    const allocated = projectBudgets.reduce((sum, item) => sum + item.allocated, 0);
    const spent = projectBudgets.reduce((sum, item) => sum + item.spent, 0);
    return { projectTitle: project.title, allocated, spent };
  });

  return (
    <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">CFO</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Financial Control Center</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Budget allocation, utilization, and cost-deviation monitoring from Neon financial records.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Allocated</p>
            <p className="mt-1 text-2xl font-black">{formatMoney(totalAllocated)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Spent</p>
            <p className="mt-1 text-2xl font-black">{formatMoney(totalSpent)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Utilization</p>
            <p className="mt-1 text-2xl font-black">{utilization}%</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Pending Cost Deviations</p>
            <p className="mt-1 text-2xl font-black">{pendingCostDeviations}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">Budget by Project</h2>
            <div className="mt-4 space-y-3">
              {budgetByProject.length === 0 && <p className="text-sm text-zinc-500">No budget allocations yet.</p>}
              {budgetByProject.map((row) => (
                <div key={row.projectTitle} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <p className="font-semibold">{row.projectTitle}</p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    Allocated {formatMoney(row.allocated)} • Spent {formatMoney(row.spent)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">Cost Deviation Queue</h2>
            <div className="mt-4 space-y-3">
              {deviations.length === 0 && <p className="text-sm text-zinc-500">No cost deviations logged.</p>}
              {deviations.map((item) => (
                <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.project.title}</p>
                    <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">
                      {item.approvedAt ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300">{item.reason}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Delta {item.delta}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
    </div>
  );
}
