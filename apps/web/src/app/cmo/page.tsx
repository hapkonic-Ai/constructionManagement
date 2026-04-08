import { redirect } from 'next/navigation';
import { prisma } from '@nexus/db';
import { auth } from '@/lib/auth';

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default async function CMOPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [materials, labourCosts, projects] = await Promise.all([
    prisma.material.findMany({
      orderBy: { totalCost: 'desc' },
      take: 12,
      include: { project: { select: { title: true } } },
    }),
    prisma.labourCost.findMany({
      orderBy: { estimatedCost: 'desc' },
      take: 12,
      include: { project: { select: { title: true } } },
    }),
    prisma.project.findMany({
      select: { id: true, title: true, _count: { select: { materials: true, labourCosts: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalMaterialCost = materials.reduce((sum, material) => sum + material.totalCost, 0);
  const totalLabourEstimate = labourCosts.reduce((sum, cost) => sum + cost.estimatedCost, 0);

  return (
    <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">CMO</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Materials & Cost Operations</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Procurement, material spend, and labour-cost visibility sourced from Neon database records.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Active Projects</p>
            <p className="mt-1 text-2xl font-black">{projects.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Material Cost (Top Items)</p>
            <p className="mt-1 text-2xl font-black">{formatMoney(totalMaterialCost)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Labour Estimate (Top Items)</p>
            <p className="mt-1 text-2xl font-black">{formatMoney(totalLabourEstimate)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Tracked Materials</p>
            <p className="mt-1 text-2xl font-black">{materials.length}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">High-Value Materials</h2>
            <div className="mt-4 space-y-3">
              {materials.length === 0 && <p className="text-sm text-zinc-500">No materials recorded.</p>}
              {materials.map((material) => (
                <div key={material.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{material.name}</p>
                    <p className="font-semibold">{formatMoney(material.totalCost)}</p>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">{material.project.title}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Qty {material.quantity} • Unit {formatMoney(material.unitCost)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold">Labour Cost Categories</h2>
            <div className="mt-4 space-y-3">
              {labourCosts.length === 0 && <p className="text-sm text-zinc-500">No labour costs recorded.</p>}
              {labourCosts.map((cost) => (
                <div key={cost.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{cost.category}</p>
                    <p className="font-semibold">{formatMoney(cost.estimatedCost)}</p>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">{cost.project.title}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
    </div>
  );
}
