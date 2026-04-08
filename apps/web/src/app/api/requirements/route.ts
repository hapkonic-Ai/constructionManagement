import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireFeature, requireRoles } from '@/lib/access';

const createSchema = z.object({
  projectId: z.string().cuid(),
  summary: z.string().min(2),
  notes: z.string().max(2000).optional(),
  additionalCost: z.number().nonnegative().optional(),
});

const updateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNote: z.string().max(2000).optional(),
  allocatedAmount: z.number().nonnegative().optional(),
});

export async function GET(req: Request) {
  const auth = await requireRoles(['SA', 'CEO', 'CMO', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'FINANCE_VIEW');
  if (!feature.ok) return feature.response;

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');

  const requirements = await prisma.requirementRequest.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      project: { select: { id: true, title: true } },
      cmo: { select: { id: true, name: true, role: true } },
      approvedBy: { select: { id: true, name: true, role: true } },
    },
  });

  return ok(requirements);
}

export async function POST(req: Request) {
  const auth = await requireRoles(['SA', 'CMO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'FINANCE_VIEW');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const [materials, labourCosts] = await Promise.all([
    prisma.material.aggregate({
      where: { projectId: parsed.data.projectId },
      _sum: { totalCost: true },
    }),
    prisma.labourCost.aggregate({
      where: { projectId: parsed.data.projectId },
      _sum: { estimatedCost: true },
    }),
  ]);

  const totalMaterialCost = materials._sum.totalCost ?? 0;
  const totalLabourCost = labourCosts._sum.estimatedCost ?? 0;
  const additionalCost = parsed.data.additionalCost ?? 0;
  const requestedAmount = totalMaterialCost + totalLabourCost + additionalCost;

  const requirement = await prisma.requirementRequest.create({
    data: {
      projectId: parsed.data.projectId,
      cmoId: auth.user.id,
      summary: parsed.data.summary,
      notes: parsed.data.notes,
      additionalCost,
      totalMaterialCost,
      totalLabourCost,
      requestedAmount,
    },
    include: {
      project: { select: { id: true, title: true } },
      cmo: { select: { id: true, name: true, role: true } },
    },
  });

  return ok(requirement);
}

export async function PATCH(req: Request) {
  const auth = await requireRoles(['SA', 'CFO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'FINANCE_VIEW');
  if (!feature.ok) return feature.response;

  const payload = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const requirement = await prisma.requirementRequest.findUnique({
    where: { id: parsed.data.id },
  });
  if (!requirement) return fail('Requirement not found', 404);

  const updated = await prisma.$transaction(async (tx) => {
    const requirementUpdate = await tx.requirementRequest.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        reviewNote: parsed.data.reviewNote,
        approvedById: auth.user.id,
        approvedAt: parsed.data.status === 'APPROVED' ? new Date() : null,
        rejectedAt: parsed.data.status === 'REJECTED' ? new Date() : null,
      },
      include: {
        project: { select: { id: true, title: true } },
        cmo: { select: { id: true, name: true, role: true } },
        approvedBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (parsed.data.status === 'APPROVED') {
      await tx.budgetAllocation.create({
        data: {
          projectId: requirement.projectId,
          cfOId: auth.user.id,
          allocated: parsed.data.allocatedAmount ?? requirement.requestedAmount,
          spent: 0,
        },
      });
    }

    return requirementUpdate;
  });

  return ok(updated);
}
