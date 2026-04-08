import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireRoles, requireFeature } from '@/lib/access';

const schema = z.object({
  projectId: z.string().cuid(),
  category: z.string().min(2),
  estimatedCost: z.number().nonnegative(),
});

export async function GET() {
  const auth = await requireRoles(['SA', 'CEO', 'CMO', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'FINANCE_VIEW');
  if (!feature.ok) return feature.response;

  const [labourCosts, budgets] = await Promise.all([
    prisma.labourCost.findMany({ orderBy: { category: 'asc' } }),
    prisma.budgetAllocation.findMany({ orderBy: { updatedAt: 'desc' } }),
  ]);

  return ok({ labourCosts, budgets });
}

export async function POST(req: Request) {
  const auth = await requireRoles(['SA', 'CMO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'FINANCE_VIEW');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const cost = await prisma.labourCost.create({
    data: {
      ...parsed.data,
      cmOId: auth.user.id,
    },
  });

  return ok(cost);
}
