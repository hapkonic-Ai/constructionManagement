import { auth } from "@/lib/auth";
import type { AppRole } from "@/lib/roles";

export type Role = AppRole;

export type SessionUser = {
  id: string;
  role: Role;
  email?: string | null;
  name?: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user as Partial<SessionUser> | undefined;

  if (!user?.id || !user.role) {
    return null;
  }

  return {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
}

export function canManageProjects(role: Role): boolean {
  return role === "SA" || role === "CEO";
}
