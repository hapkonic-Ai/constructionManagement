import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@nexus/db';
import { auth, signOut } from '@/lib/auth';
import { createPlatformUser, toggleRoleFeature } from '@/app/actions/superadmin';
import ThemeToggle from '@/components/ui/ThemeToggle';

const ROLES = ['SA', 'CEO', 'CTO', 'CDO', 'COO', 'CMO', 'CFO'] as const;
type UserRow = { id: string; name: string; email: string; role: string; createdAt: Date };
type FeatureRow = { id: string; name: string; code: string };
type AuditRow = { id: string; action: string; entity: string; createdAt: Date; actor: { name: string; role: string } };

export default async function SuperAdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== 'SA') {
    redirect('/login');
  }

  const [users, projects, features, roleFeatures, auditLogs] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.project.count(),
    prisma.feature.findMany({ orderBy: { name: 'asc' } }),
    prisma.roleFeature.findMany(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { actor: { select: { name: true, role: true } } },
    }),
  ]);

  type RoleFeatureRow = { roleCode: string; featureCode: string; enabled: boolean };
  const rfMap = new Map(
    (roleFeatures as RoleFeatureRow[]).map((rf) => [`${rf.roleCode}:${rf.featureCode}`, rf.enabled]),
  );
  const userRows = users as UserRow[];
  const featureRows = features as FeatureRow[];
  const auditRows = auditLogs as AuditRow[];

  async function createUserAction(formData: FormData) {
    "use server";
    await createPlatformUser(formData);
  }

  async function toggleFeatureAction(formData: FormData) {
    "use server";
    await toggleRoleFeature(formData);
  }

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: '/login' });
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">SuperAdmin</p>
            <h1 className="mt-2 text-4xl font-black">Platform Control Center</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/profile/me" className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold hover:bg-zinc-800">
              Profile
            </Link>
            <Link href="/superadmin/notifications" className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold hover:bg-zinc-800">
              Notifications
            </Link>
            <Link href="/superadmin/settings" className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold hover:bg-zinc-800">
              Settings
            </Link>
            <ThemeToggle />
            <form action={logoutAction}>
              <button className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold hover:bg-zinc-800">
                Logout
              </button>
            </form>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-xs text-zinc-400">Active Users</p>
            <p className="mt-2 text-3xl font-black">{users.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-xs text-zinc-400">Projects</p>
            <p className="mt-2 text-3xl font-black">{projects}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-xs text-zinc-400">Feature Flags</p>
            <p className="mt-2 text-3xl font-black">{features.length}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-bold">User Management</h2>
          <form action={createUserAction} className="mt-4 grid gap-3 md:grid-cols-5">
            <input name="name" placeholder="Name" className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2" required />
            <input name="email" type="email" placeholder="Email" className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2" required />
            <input name="password" type="password" placeholder="Temp Password" className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2" required />
            <select name="role" className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2" defaultValue="CEO">
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold">Create User</button>
          </form>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-400">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((u) => (
                  <tr key={u.id} className="border-t border-zinc-800">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{u.role}</td>
                    <td className="py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-bold">Role Feature Matrix</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left text-zinc-400">Feature</th>
                  {ROLES.map((roleCode) => (
                    <th key={roleCode} className="p-2 text-zinc-400">{roleCode}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureRows.map((feature) => (
                  <tr key={feature.code} className="border-t border-zinc-800">
                    <td className="p-2">{feature.name}</td>
                    {ROLES.map((roleCode) => {
                      const key = `${roleCode}:${feature.code}`;
                      const enabled = rfMap.get(key) ?? false;

                      return (
                        <td key={key} className="p-2 text-center">
                          <form action={toggleFeatureAction}>
                            <input type="hidden" name="roleCode" value={roleCode} />
                            <input type="hidden" name="featureCode" value={feature.code} />
                            <input type="hidden" name="enabled" value={String(!enabled)} />
                            <button
                              className={`rounded-md px-3 py-1 text-xs font-semibold ${enabled ? 'bg-emerald-600' : 'bg-zinc-700'}`}
                            >
                              {enabled ? 'ON' : 'OFF'}
                            </button>
                          </form>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-bold">Audit Log Viewer</h2>
          <div className="mt-4 space-y-2 text-sm">
            {auditRows.length === 0 && <p className="text-zinc-400">No audit logs yet.</p>}
            {auditRows.map((log) => (
              <div key={log.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                <p className="font-semibold">{log.action} <span className="text-zinc-400">({log.entity})</span></p>
                <p className="text-zinc-400">Actor: {log.actor.name} ({log.actor.role})</p>
                <p className="text-zinc-500">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
