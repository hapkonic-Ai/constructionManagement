import RoleWorkspaceLayout from '@/components/layout/RoleWorkspaceLayout';

export const dynamic = 'force-dynamic';

export default function CTORoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleWorkspaceLayout
      roleLabel="CTO"
      navLinks={[
        { href: '/cto', label: 'Dashboard' },
        { href: '/cto/work', label: 'Workbench' },
        { href: '/cto/projects', label: 'Projects' },
      ]}
    >
      {children}
    </RoleWorkspaceLayout>
  );
}
