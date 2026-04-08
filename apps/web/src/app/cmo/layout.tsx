import RoleWorkspaceLayout from '@/components/layout/RoleWorkspaceLayout';

export const dynamic = 'force-dynamic';

export default function CMORoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleWorkspaceLayout
      roleLabel="CMO"
      navLinks={[
        { href: '/cmo', label: 'Dashboard' },
        { href: '/cmo/work', label: 'Workbench' },
        { href: '/cmo/projects', label: 'Projects' },
      ]}
    >
      {children}
    </RoleWorkspaceLayout>
  );
}
