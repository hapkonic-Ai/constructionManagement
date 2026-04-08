import { prisma } from "@nexus/db";
import { z } from "zod";
import { fail, ok } from "@/lib/api-response";
import { canManageProjects, getSessionUser } from "@/lib/session";
import { requireFeature } from "@/lib/access";

const createProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  location: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.string().max(50).optional(),
  ceoId: z.string().cuid().optional(),
});

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }
  const feature = await requireFeature(user, "DASHBOARD");
  if (!feature.ok) return feature.response;

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      location: true,
      description: true,
      status: true,
      createdAt: true,
      ceo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
          ganttTasks: true,
          deviations: true,
          progressUpdates: true,
        },
      },
      budgets: {
        select: {
          allocated: true,
          spent: true,
        },
      },
      progressUpdates: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          note: true,
          createdAt: true,
          coo: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
      deviations: {
        orderBy: { approvedAt: "desc" },
        take: 1,
        select: {
          id: true,
          type: true,
          delta: true,
          reason: true,
          approvedAt: true,
        },
      },
    },
  });

  return ok(projects, { count: projects.length });
}

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  if (!canManageProjects(user.role)) {
    return fail("Forbidden: only SA/CEO can create projects", 403);
  }
  const feature = await requireFeature(user, "PROJECT_CREATE");
  if (!feature.ok) return feature.response;

  const payload = await request.json().catch(() => null);
  const validated = createProjectSchema.safeParse(payload);

  if (!validated.success) {
    return fail(validated.error.issues[0]?.message ?? "Invalid payload", 422, {
      issues: validated.error.issues,
    });
  }

  const ceoId = validated.data.ceoId ?? user.id;

  const ceo = await prisma.user.findUnique({
    where: { id: ceoId },
    select: { id: true, role: true },
  });

  if (!ceo) {
    return fail("CEO user not found", 404);
  }

  if (ceo.role !== "CEO" && ceo.role !== "SA") {
    return fail("ceoId must belong to a CEO/SA account", 422);
  }

  const project = await prisma.project.create({
    data: {
      title: validated.data.title,
      location: validated.data.location,
      description: validated.data.description,
      status: validated.data.status ?? "ACTIVE",
      ceoId,
    },
    select: {
      id: true,
      title: true,
      location: true,
      description: true,
      status: true,
      createdAt: true,
      ceo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return ok(project);
}
