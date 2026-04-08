import { prisma } from '@nexus/db';
import { fail } from '@/lib/api-response';
import { getSessionUser, type Role, type SessionUser } from '@/lib/session';

export type AuthResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: Response };

export async function requireRoles(roles: Role[]): Promise<AuthResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, response: fail('Unauthorized', 401) };
  }
  if (!roles.includes(user.role)) {
    return { ok: false, response: fail('Forbidden', 403) };
  }
  return { ok: true, user };
}

export async function requireFeature(user: SessionUser, featureCode: string): Promise<AuthResult> {
  if (user.role === 'SA') {
    return { ok: true, user };
  }

  const flag = await prisma.roleFeature.findUnique({
    where: {
      roleCode_featureCode: {
        roleCode: user.role,
        featureCode,
      },
    },
    select: { enabled: true },
  });

  if (!flag?.enabled) {
    return { ok: false, response: fail(`Feature ${featureCode} disabled for role ${user.role}`, 403) };
  }

  return { ok: true, user };
}
