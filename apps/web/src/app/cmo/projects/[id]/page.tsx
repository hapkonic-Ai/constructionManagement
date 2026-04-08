import { notFound } from 'next/navigation';
import { prisma } from '@nexus/db';
import CMOWorkbench from '@/components/role/CMOWorkbench';

export default async function CMOProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!project) notFound();

  return <CMOWorkbench initialProjectId={id} />;
}
