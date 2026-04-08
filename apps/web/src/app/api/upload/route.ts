import { ok, fail } from '@/lib/api-response';
import { requireRoles } from '@/lib/access';

// MVP placeholder signed-upload response shape.
// Replace with Vercel Blob client integration when token is configured.
export async function POST() {
  const auth = await requireRoles(['SA', 'CEO', 'CTO', 'CDO', 'COO', 'CMO', 'CFO']);
  if (!auth.ok) return auth.response;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return fail('BLOB_READ_WRITE_TOKEN is not configured', 500);
  }

  return ok({
    uploadUrl: null,
    note: 'Integrate @vercel/blob put() for signed URL generation in next iteration.',
  });
}
