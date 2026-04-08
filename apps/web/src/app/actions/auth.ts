'use server';

import { prisma } from "@nexus/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const ROLE_VALUES = ["SA", "CEO", "CTO", "CDO", "COO", "CMO", "CFO"] as const;
type Role = (typeof ROLE_VALUES)[number];

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ROLE_VALUES),
});

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  const validated = registerSchema.safeParse({ name, email, password, role });

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return { success: "User created successfully", userId: user.id };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong during registration" };
  }
}
