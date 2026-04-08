import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireRoles, requireFeature } from '@/lib/access';

const memberSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['SA', 'CEO', 'CTO', 'CDO', 'COO', 'CMO', 'CFO']),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(['SA', 'CEO']);
  if (!auth.ok) return auth.response;

  const feature = await requireFeature(auth.user, 'PROJECT_CREATE');
  if (!feature.ok) return feature.response;

  const { id } = await ctx.params;
  const members = await prisma.projectMember.findMany({
    where: { projectId: id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  return ok(members);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(['SA', 'CEO']);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const payload = await req.json().catch(() => null);
  const parsed = memberSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const exists = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return fail('Project not found', 404);

  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: id, userId: parsed.data.userId } },
    update: { role: parsed.data.role },
    create: { projectId: id, userId: parsed.data.userId, role: parsed.data.role },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  return ok(member);
}
