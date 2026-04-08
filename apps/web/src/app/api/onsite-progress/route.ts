import { prisma } from '@nexus/db';
import { ok } from '@/lib/api-response';
import { requireFeature, requireRoles } from '@/lib/access';

export async function GET() {
  const auth = await requireRoles(['SA', 'CEO', 'COO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'PROGRESS_UPDATE');
  if (!feature.ok) return feature.response;

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      members: { select: { id: true } },
      progressUpdates: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, createdAt: true, note: true },
      },
      deviations: {
        where: { type: 'TIMELINE', approvedAt: null },
        select: { id: true },
      },
      ganttTasks: {
        select: { id: true, progress: true },
      },
    },
  });

  const shaped = projects.map((project) => {
    const taskCount = project.ganttTasks.length;
    const avgTaskProgress = taskCount > 0
      ? Math.round(project.ganttTasks.reduce((sum, task) => sum + task.progress, 0) / taskCount)
      : 0;
    return {
      id: project.id,
      title: project.title,
      status: project.status,
      avgTaskProgress,
      taskCount,
      membersCount: project.members.length,
      lastUpdate: project.progressUpdates[0] ?? null,
      pendingTimelineDeviations: project.deviations.length,
    };
  });

  return ok(shaped);
}
