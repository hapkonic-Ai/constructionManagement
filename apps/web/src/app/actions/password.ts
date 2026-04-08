'use server';

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@nexus/db';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetSchema = z.object({
  token: z.string().min(12),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email') || '');
  const parsed = emailSchema.safeParse({ email });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid email' };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Do not leak whether an account exists.
  if (!user) {
    return { success: 'If this email exists, a reset link has been generated.' };
  }

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Replace with real email provider in production.
  const resetLink = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`;

  return {
    success: 'Reset link generated. Use the link below.',
    resetLink,
  };
}

export async function resetPassword(formData: FormData) {
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');
  const parsed = resetSchema.safeParse({ token, password });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid request' };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: 'Reset token is invalid or expired' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: 'Password updated successfully' };
}
