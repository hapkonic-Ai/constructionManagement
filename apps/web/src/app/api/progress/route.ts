import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireRoles, requireFeature } from '@/lib/access';

const schema = z.object({
  projectId: z.string().cuid(),
  note: z.string().min(2),
  attachments: z.array(z.string()).optional(),
});

export async function GET() {
  const auth = await requireRoles(['SA', 'CEO', 'COO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'PROGRESS_UPDATE');
  if (!feature.ok) return feature.response;

  const updates = await prisma.progressUpdate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { coo: { select: { id: true, name: true, role: true } }, project: { select: { id: true, title: true } } },
  });
  return ok(updates);
}

export async function POST(req: Request) {
  const auth = await requireRoles(['SA', 'COO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'PROGRESS_UPDATE');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const update = await prisma.progressUpdate.create({
    data: {
      projectId: parsed.data.projectId,
      cooId: auth.user.id,
      note: parsed.data.note,
      attachments: parsed.data.attachments ?? [],
    },
  });

  return ok(update);
}
