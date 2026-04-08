import { prisma } from '@nexus/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ok, fail } from '@/lib/api-response';
import { requireRoles, requireFeature } from '@/lib/access';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['SA', 'CEO', 'CTO', 'CDO', 'COO', 'CMO', 'CFO']),
});

export async function GET() {
  const auth = await requireRoles(['SA', 'CEO']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'ADMIN_PANEL');
  if (!feature.ok) return feature.response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, bio: true, contact: true, createdAt: true },
  });

  return ok(users, { count: users.length });
}

export async function POST(request: Request) {
  const auth = await requireRoles(['SA']);
  if (!auth.ok) return auth.response;
  const feature = await requireFeature(auth.user, 'ADMIN_PANEL');
  if (!feature.ok) return feature.response;

  const payload = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(payload);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 422);

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return fail('User already exists', 409);

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: { ...parsed.data, password: hashed },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return ok(user);
}
