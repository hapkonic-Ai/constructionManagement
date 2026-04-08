'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { prisma } from '@nexus/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const ROLE_VALUES = ['SA', 'CEO', 'CTO', 'CDO', 'COO', 'CMO', 'CFO'] as const;
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(ROLE_VALUES),
});

async function requireSA() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'SA') {
    throw new Error('Forbidden');
  }
}

export async function createPlatformUser(formData: FormData) {
  await requireSA();

  const payload = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    password: String(formData.get('password') || ''),
    role: String(formData.get('role') || ''),
  };

  const parsed = createUserSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) {
    return { error: 'User with this email already exists' };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      role: parsed.data.role,
    },
  });

  revalidatePath('/superadmin');
  return { success: 'User created' };
}

export async function toggleRoleFeature(formData: FormData) {
  await requireSA();

  const roleCode = String(formData.get('roleCode') || '');
  const featureCode = String(formData.get('featureCode') || '');
  const enabled = String(formData.get('enabled') || '') === 'true';

  if (!roleCode || !featureCode) {
    return { error: 'Invalid role-feature toggle' };
  }

  await prisma.roleFeature.upsert({
    where: {
      roleCode_featureCode: {
        roleCode,
        featureCode,
      },
    },
    update: { enabled },
    create: {
      roleCode,
      featureCode,
      enabled,
    },
  });

  revalidatePath('/superadmin');
  return { success: 'Feature updated' };
}
