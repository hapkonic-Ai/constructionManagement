import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireFeature, requireRoles } from '@/lib/access';

const createSchema = z.object({
  projectId: z.string().cuid(),
  allocated: z.number().nonnegative(),
  spent: z.number().nonnegative().optional(),
});

const updateSchema = z.object({
  id: z.string().cuid(),
  allocated: z.number().nonnegative().optional(),
  spent: z.number().nonnegative().optional(),
});

export async function GET() {
  const auth = await requireRoles(['SA', 'CEO', 'CMO', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'FINANCE_VIEW');
  if (!feature.ok) return feature.response;

  const budgets = await prisma.budgetAllocation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      project: { select: { id: true, title: true } },
      cfo: { select: { id: true, name: true, role: true } },
    },
  });
  return ok(budgets);
}

export async function POST(req: Request) {
  const auth = await requireRoles(['SA', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'FINANCE_VIEW');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const budget = await prisma.budgetAllocation.create({
    data: {
      projectId: parsed.data.projectId,
      cfOId: auth.user.id,
      allocated: parsed.data.allocated,
      spent: parsed.data.spent ?? 0,
    },
    include: { project: { select: { id: true, title: true } } },
  });

  return ok(budget);
}

export async function PATCH(req: Request) {
  const auth = await requireRoles(['SA', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'FINANCE_VIEW');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const updated = await prisma.budgetAllocation.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.allocated !== undefined ? { allocated: parsed.data.allocated } : {}),
      ...(parsed.data.spent !== undefined ? { spent: parsed.data.spent } : {}),
    },
    include: { project: { select: { id: true, title: true } } },
  }).catch(() => null);

  if (!updated) return fail('Budget allocation not found', 404);
  return ok(updated);
}
