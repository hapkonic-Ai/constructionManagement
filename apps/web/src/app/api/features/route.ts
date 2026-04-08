import { prisma } from '@nexus/db';
import { fail, ok } from '@/lib/api-response';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return fail('Unauthorized', 401);
  }

  const rows = await prisma.roleFeature.findMany({
    where: { roleCode: user.role },
    select: {
      featureCode: true,
      enabled: true,
      feature: {
        select: { name: true, code: true },
      },
    },
  });

  type FeatureRow = {
    featureCode: string;
    enabled: boolean;
    feature: { name: string; code: string };
  };

  return ok(
    (rows as FeatureRow[]).map((r) => ({
      code: r.featureCode,
      name: r.feature.name,
      enabled: r.enabled,
    })),
  );
}
