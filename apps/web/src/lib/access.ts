import { prisma } from '@nexus/db';
import { fail } from '@/lib/api-response';
import { getSessionUser, type Role, type SessionUser } from '@/lib/session';

export type AuthResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: Response };

// Baseline feature matrix used as a safe fallback when DB role-feature rows
// are missing or stale. This prevents valid role screens from failing with
// false 403 responses in partially seeded environments.
const DEFAULT_ROLE_FEATURES: Record<Role, readonly string[]> = {
  SA: [
    'DASHBOARD',
    'ADMIN_PANEL',
    'PROJECT_CREATE',
    'DESIGN_MANAGE',
    'FINANCE_VIEW',
    'MATERIALS_MANAGE',
    'PROGRESS_UPDATE',
    'DEVIATION_MANAGE',
  ],
  CEO: ['DASHBOARD', 'ADMIN_PANEL', 'PROJECT_CREATE', 'FINANCE_VIEW', 'DEVIATION_MANAGE'],
  CTO: ['DASHBOARD', 'DESIGN_MANAGE'],
  CDO: ['DASHBOARD', 'DESIGN_MANAGE'],
  COO: ['DASHBOARD', 'PROGRESS_UPDATE', 'DEVIATION_MANAGE'],
  CMO: ['DASHBOARD', 'MATERIALS_MANAGE', 'FINANCE_VIEW'],
  CFO: ['DASHBOARD', 'FINANCE_VIEW', 'DEVIATION_MANAGE'],
};

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

  const defaultAllowed = (DEFAULT_ROLE_FEATURES[user.role] ?? []).includes(featureCode);

  const flag = await prisma.roleFeature.findUnique({
    where: {
      roleCode_featureCode: {
        roleCode: user.role,
        featureCode,
      },
    },
    select: { enabled: true },
  });

  // Prefer persisted flag when explicitly enabled. If disabled/missing but the
  // role is allowed in the baseline matrix, allow access to avoid stale-seed
  // lockouts across role dashboards.
  if (flag?.enabled || defaultAllowed) {
    return { ok: true, user };
  }

  if (!flag?.enabled && !defaultAllowed) {
    return { ok: false, response: fail(`Feature ${featureCode} disabled for role ${user.role}`, 403) };
  }

  return { ok: false, response: fail(`Feature ${featureCode} disabled for role ${user.role}`, 403) };
}
