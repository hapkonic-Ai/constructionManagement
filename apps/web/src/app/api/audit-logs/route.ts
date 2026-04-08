import { prisma } from '@nexus/db';
import { ok } from '@/lib/api-response';
import { requireRoles, requireFeature } from '@/lib/access';

export async function GET(request: Request) {
  const auth = await requireRoles(['SA', 'CEO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'ADMIN_PANEL');
  if (!feature.ok) return feature.response;

  const { searchParams } = new URL(request.url);
  const actorId = searchParams.get('actorId') || undefined;
  const entity = searchParams.get('entity') || undefined;
  const action = searchParams.get('action') || undefined;
  const take = Math.min(Number(searchParams.get('take') || 50), 200);

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(actorId ? { actorId } : {}),
      ...(entity ? { entity } : {}),
      ...(action ? { action: { contains: action, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take,
    include: { actor: { select: { id: true, name: true, role: true } } },
  });

  return ok(logs, { count: logs.length });
}
