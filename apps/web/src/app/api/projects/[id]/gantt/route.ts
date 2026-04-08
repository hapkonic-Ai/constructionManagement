import { prisma } from '@nexus/db';
import { z } from 'zod';
import { ok, fail } from '@/lib/api-response';
import { requireRoles } from '@/lib/access';

const taskSchema = z.object({
  title: z.string().min(2),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  progress: z.number().min(0).max(100).optional(),
  assignedTo: z.string().optional(),
  parentId: z.string().optional(),
});
const updateSchema = taskSchema.partial().extend({ id: z.string().cuid() });
const deleteSchema = z.object({ id: z.string().cuid() });

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(['SA', 'CEO', 'CTO', 'COO']);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const tasks = await prisma.ganttTask.findMany({ where: { projectId: id }, orderBy: { startDate: 'asc' } });
  return ok(tasks);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(['SA', 'CEO', 'CTO']);
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const payload = await req.json().catch(() => null);
  const parsed = taskSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const task = await prisma.ganttTask.create({
    data: {
      projectId: id,
      title: parsed.data.title,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      progress: parsed.data.progress ?? 0,
      assignedTo: parsed.data.assignedTo,
      parentId: parsed.data.parentId,
    },
  });

  return ok(task);
}

export async function PATCH(req: Request) {
  const auth = await requireRoles(['SA', 'CEO', 'CTO']);
  if (!auth.ok) return auth.response;

  const payload = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const updated = await prisma.ganttTask.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      ...(parsed.data.startDate ? { startDate: parsed.data.startDate } : {}),
      ...(parsed.data.endDate ? { endDate: parsed.data.endDate } : {}),
      ...(parsed.data.progress !== undefined ? { progress: parsed.data.progress } : {}),
      ...(parsed.data.assignedTo !== undefined ? { assignedTo: parsed.data.assignedTo } : {}),
      ...(parsed.data.parentId !== undefined ? { parentId: parsed.data.parentId } : {}),
    },
  }).catch(() => null);

  if (!updated) return fail('Task not found', 404);
  return ok(updated);
}

export async function DELETE(req: Request) {
  const auth = await requireRoles(['SA', 'CEO', 'CTO']);
  if (!auth.ok) return auth.response;

  const payload = await req.json().catch(() => null);
  const parsed = deleteSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const deleted = await prisma.ganttTask.delete({ where: { id: parsed.data.id } }).catch(() => null);
  if (!deleted) return fail('Task not found', 404);
  return ok(deleted);
}
