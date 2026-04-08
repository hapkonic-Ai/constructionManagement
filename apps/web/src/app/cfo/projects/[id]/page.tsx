import { notFound } from 'next/navigation';
import { prisma } from '@nexus/db';
import CFOWorkbench from '@/components/role/CFOWorkbench';

export default async function CFOProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!project) notFound();

  return <CFOWorkbench initialProjectId={id} />;
}
