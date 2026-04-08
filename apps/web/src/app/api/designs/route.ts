import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireRoles, requireFeature } from '@/lib/access';

const designSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(2),
  order: z.number().int().min(0),
  plannedStartAt: z.string().datetime().optional(),
  plannedEndAt: z.string().datetime().optional(),
  milestones: z.array(z.string()).optional(),
  estimatedDays: z.number().int().min(1).optional(),
});

const updateDesignSchema = z.object({
  id: z.string().cuid(),
  projectId: z.string().cuid().optional(),
  title: z.string().min(2).optional(),
  order: z.number().int().min(0).optional(),
  status: z.enum(['DRAFT', 'READY', 'RELEASED', 'ACKNOWLEDGED']).optional(),
  plannedStartAt: z.string().datetime().nullable().optional(),
  plannedEndAt: z.string().datetime().nullable().optional(),
  milestones: z.array(z.string()).optional(),
  estimatedDays: z.number().int().min(1).optional(),
});

export async function GET(req: Request) {
  const auth = await requireRoles(['SA', 'CEO', 'CTO', 'CDO']);
  if (!auth.ok) return auth.response;

  const feature = await requireFeature(auth.user, 'DESIGN_MANAGE');
  if (!feature.ok) return feature.response;

  // Optional filtering by project for role workbenches.
  // Supported as /api/designs?projectId=<cuid>
  const reqUrl = new URL(req.url);
  const projectIdParam = reqUrl.searchParams.get('projectId');

  const designs = await prisma.design.findMany({
    where: projectIdParam ? { projectId: projectIdParam } : undefined,
    orderBy: [{ projectId: 'asc' }, { order: 'asc' }],
    include: { timeline: true, project: { select: { id: true, title: true } }, creator: { select: { id: true, name: true, role: true } } },
  });
  return ok(designs);
}

export async function POST(req: Request) {
  const auth = await requireRoles(['SA', 'CTO', 'CDO']);
  if (!auth.ok) return auth.response;

  const payload = await req.json().catch(() => null);
  const parsed = designSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const design = await prisma.design.create({
    data: {
      projectId: parsed.data.projectId,
      creatorId: auth.user.id,
      title: parsed.data.title,
      order: parsed.data.order,
      status: 'DRAFT',
      plannedStartAt: parsed.data.plannedStartAt ? new Date(parsed.data.plannedStartAt) : undefined,
      plannedEndAt: parsed.data.plannedEndAt ? new Date(parsed.data.plannedEndAt) : undefined,
      timeline: parsed.data.milestones || parsed.data.estimatedDays
        ? { create: { milestones: parsed.data.milestones ?? [], estimatedDays: parsed.data.estimatedDays ?? 7 } }
        : undefined,
    },
    include: { timeline: true },
  });

  return ok(design);
}

export async function PATCH(req: Request) {
  const auth = await requireRoles(['SA', 'CTO', 'CDO']);
  if (!auth.ok) return auth.response;

  const feature = await requireFeature(auth.user, 'DESIGN_MANAGE');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = updateDesignSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const updated = await prisma.$transaction(async (tx: any) => {
    await tx.design.update({
      where: { id: parsed.data.id },
      data: {
        ...(parsed.data.projectId ? { projectId: parsed.data.projectId } : {}),
        ...(parsed.data.title ? { title: parsed.data.title } : {}),
        ...(parsed.data.order !== undefined ? { order: parsed.data.order } : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.status === 'RELEASED' ? { releasedAt: new Date() } : {}),
        ...(parsed.data.plannedStartAt !== undefined
          ? { plannedStartAt: parsed.data.plannedStartAt ? new Date(parsed.data.plannedStartAt) : null }
          : {}),
        ...(parsed.data.plannedEndAt !== undefined
          ? { plannedEndAt: parsed.data.plannedEndAt ? new Date(parsed.data.plannedEndAt) : null }
          : {}),
      },
    }).catch(() => null);

    const hasTimelineUpdate = parsed.data.milestones !== undefined || parsed.data.estimatedDays !== undefined;
    if (hasTimelineUpdate) {
      const existingTimeline = await tx.designTimeline.findUnique({
        where: { designId: parsed.data.id },
      });

      if (existingTimeline) {
        await tx.designTimeline.update({
          where: { designId: parsed.data.id },
          data: {
            ...(parsed.data.milestones !== undefined ? { milestones: parsed.data.milestones } : {}),
            ...(parsed.data.estimatedDays !== undefined ? { estimatedDays: parsed.data.estimatedDays } : {}),
          },
        });
      } else {
        await tx.designTimeline.create({
          data: {
            designId: parsed.data.id,
            milestones: parsed.data.milestones ?? [],
            estimatedDays: parsed.data.estimatedDays ?? 7,
          },
        });
      }
    }

    return tx.design.findUnique({
      where: { id: parsed.data.id },
      include: { timeline: true, project: { select: { id: true, title: true } } },
    });
  }).catch(() => null);

  if (!updated) return fail('Design not found', 404);
  return ok(updated);
}
