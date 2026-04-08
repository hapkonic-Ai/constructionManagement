import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireRoles, requireFeature } from '@/lib/access';

const createSchema = z.object({
  userId: z.string().cuid().optional(),
  title: z.string().min(2),
  body: z.string().min(2),
});

const markReadSchema = z.object({ id: z.string().cuid() });

export async function GET() {
  const auth = await requireRoles(['SA', 'CEO', 'CTO', 'CDO', 'COO', 'CMO', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'DASHBOARD');
  if (!feature.ok) return feature.response;

  const rows = await prisma.notification.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return ok(rows);
}

export async function POST(req: Request) {
  const auth = await requireRoles(['SA', 'CEO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'DASHBOARD');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const targetUserId = parsed.data.userId ?? auth.user.id;

  const notification = await prisma.notification.create({
    data: { userId: targetUserId, title: parsed.data.title, body: parsed.data.body },
  });

  return ok(notification);
}

export async function PATCH(req: Request) {
  const auth = await requireRoles(['SA', 'CEO', 'CTO', 'CDO', 'COO', 'CMO', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'DASHBOARD');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = markReadSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const updated = await prisma.notification.updateMany({
    where: { id: parsed.data.id, userId: auth.user.id },
    data: { readAt: new Date() },
  });

  if (updated.count === 0) return fail('Notification not found', 404);
  return ok({ id: parsed.data.id, readAt: new Date().toISOString() });
}
