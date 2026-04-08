import { notFound } from 'next/navigation';
import { prisma } from '@nexus/db';
import COOWorkbench from '@/components/role/COOWorkbench';

export default async function COOProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!project) notFound();

  return <COOWorkbench initialProjectId={id} />;
}
