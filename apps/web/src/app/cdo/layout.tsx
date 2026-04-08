import RoleWorkspaceLayout from '@/components/layout/RoleWorkspaceLayout';

export const dynamic = 'force-dynamic';

export default function CDORoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleWorkspaceLayout
      roleLabel="CDO"
      navLinks={[
        { href: '/cdo', label: 'Dashboard' },
        { href: '/cdo/work', label: 'Workbench' },
        { href: '/cdo/projects', label: 'Projects' },
      ]}
    >
      {children}
    </RoleWorkspaceLayout>
  );
}
