import { prisma } from '@nexus/db';
import { ok, fail } from '@/lib/api-response';
import { requireRoles } from '@/lib/access';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(['SA', 'CTO', 'CDO']);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const design = await prisma.design.update({
    where: { id },
    data: { status: 'RELEASED', releasedAt: new Date() },
  }).catch(() => null);

  if (!design) return fail('Design not found', 404);
  return ok(design);
}
