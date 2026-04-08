import { notFound } from 'next/navigation';
import { prisma } from '@nexus/db';
import DesignWorkbench from '@/components/role/DesignWorkbench';

export default async function CDOProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!project) notFound();

  return <DesignWorkbench roleLabel="CDO" initialProjectId={id} />;
}
