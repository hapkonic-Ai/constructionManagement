import { prisma } from "@nexus/db";
import { fail, ok } from "@/lib/api-response";
import { getSessionUser } from "@/lib/session";
import { requireFeature } from "@/lib/access";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }
  const feature = await requireFeature(user, "DASHBOARD");
  if (!feature.ok) return feature.response;

  const { id } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      ceo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              email: true,
            },
          },
        },
      },
      budgets: true,
      designs: {
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          timeline: true,
        },
        orderBy: { order: "asc" },
      },
      materials: {
        orderBy: { name: "asc" },
      },
      labourCosts: {
        orderBy: { category: "asc" },
      },
      ganttTasks: {
        orderBy: { startDate: "asc" },
      },
      deviations: {
        orderBy: { approvedAt: "desc" },
      },
      progressUpdates: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          members: true,
          ganttTasks: true,
          deviations: true,
          progressUpdates: true,
        },
      },
    },
  });

  if (!project) {
    return fail("Project not found", 404);
  }

  return ok(project);
}
