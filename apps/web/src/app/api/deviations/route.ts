import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireRoles, requireFeature } from '@/lib/access';

const createSchema = z.object({
  projectId: z.string().cuid(),
  type: z.enum(['TIMELINE', 'COST']),
  delta: z.number(),
  reason: z.string().min(3),
});

const approveSchema = z.object({ id: z.string().cuid() });

export async function GET() {
  const auth = await requireRoles(['SA', 'CEO', 'COO', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'DEVIATION_MANAGE');
  if (!feature.ok) return feature.response;

  const deviations = await prisma.deviation.findMany({
    orderBy: { approvedAt: 'asc' },
    include: {
      coo: { select: { id: true, name: true, role: true } },
      project: { select: { id: true, title: true } },
    },
  });

  return ok(deviations);
}

export async function POST(req: Request) {
  const auth = await requireRoles(['SA', 'COO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'DEVIATION_MANAGE');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const deviation = await prisma.deviation.create({
    data: {
      ...parsed.data,
      cooId: auth.user.id,
    },
  });

  return ok(deviation);
}

export async function PATCH(req: Request) {
  const auth = await requireRoles(['SA', 'CEO', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'DEVIATION_MANAGE');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = approveSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const updated = await prisma.deviation.update({
    where: { id: parsed.data.id },
    data: { approvedAt: new Date() },
  }).catch(() => null);

  if (!updated) return fail('Deviation not found', 404);
  return ok(updated);
}
