import RoleWorkspaceLayout from '@/components/layout/RoleWorkspaceLayout';

export default function COORoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleWorkspaceLayout
      roleLabel="COO"
      navLinks={[
        { href: '/coo', label: 'Dashboard' },
        { href: '/coo/work', label: 'Workbench' },
        { href: '/coo/projects', label: 'Projects' },
      ]}
    >
      {children}
    </RoleWorkspaceLayout>
  );
}
