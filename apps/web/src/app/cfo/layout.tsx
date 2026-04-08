import RoleWorkspaceLayout from '@/components/layout/RoleWorkspaceLayout';

export const dynamic = 'force-dynamic';

export default function CFORoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleWorkspaceLayout
      roleLabel="CFO"
      navLinks={[
        { href: '/cfo', label: 'Dashboard' },
        { href: '/cfo/work', label: 'Workbench' },
        { href: '/cfo/projects', label: 'Projects' },
      ]}
    >
      {children}
    </RoleWorkspaceLayout>
  );
}
