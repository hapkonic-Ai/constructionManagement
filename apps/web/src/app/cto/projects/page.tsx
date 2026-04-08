import RoleProjectsView from '@/components/role/RoleProjectsView';

export default async function CTOProjectsPage() {
  return <RoleProjectsView roleLabel="CTO" routeBase="/cto" />;
}
