'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@nexus/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const profileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  contact: z.string().max(120).optional(),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;

  if (!sessionUser?.id) {
    return { error: 'Unauthorized' };
  }

  const payload = {
    userId: String(formData.get('userId') || ''),
    name: String(formData.get('name') || ''),
    avatarUrl: String(formData.get('avatarUrl') || ''),
    bio: String(formData.get('bio') || ''),
    contact: String(formData.get('contact') || ''),
  };

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid profile data' };
  }

  const canEdit =
    parsed.data.userId === sessionUser.id ||
    sessionUser.role === 'SA' ||
    sessionUser.role === 'CEO';

  if (!canEdit) {
    return { error: 'Forbidden' };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      name: parsed.data.name,
      avatarUrl: parsed.data.avatarUrl || null,
      bio: parsed.data.bio || null,
      contact: parsed.data.contact || null,
    },
  });

  revalidatePath(`/profile/${parsed.data.userId}`);
  return { success: 'Profile updated' };
}
