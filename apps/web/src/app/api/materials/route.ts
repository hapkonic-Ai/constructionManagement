import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireRoles, requireFeature } from '@/lib/access';

const schema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(2),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative(),
});

export async function GET() {
  const auth = await requireRoles(['SA', 'CEO', 'CMO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'MATERIALS_MANAGE');
  if (!feature.ok) return feature.response;

  const data = await prisma.material.findMany({ orderBy: { name: 'asc' } });
  return ok(data);
}

export async function POST(req: Request) {
  const auth = await requireRoles(['SA', 'CMO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'MATERIALS_MANAGE');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const material = await prisma.material.create({
    data: {
      ...parsed.data,
      totalCost: parsed.data.quantity * parsed.data.unitCost,
      cmOId: auth.user.id,
    },
  });

  return ok(material);
}
