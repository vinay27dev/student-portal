"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Helper to seed a default admin if none exists
async function ensureAdminExists() {
  const count = await prisma.admin.count();
  if (count === 0) {
    await prisma.admin.create({
      data: {
        email: "admin@test.com",
        password: "password123", // In a real app, hash this!
        name: "Super Admin",
      }
    });
  }
}

export async function adminLogin(email: string, password: string) {
  try {
    await ensureAdminExists();

    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    // For demo purposes, plain text comparison. Real app must use bcrypt.
    if (!admin || admin.password !== password) {
      return { success: false, error: "Invalid credentials." };
    }

    const cookieStore = await cookies();
    cookieStore.set(
      "admin_session",
      JSON.stringify({ id: admin.id, email: admin.email, name: admin.name }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Admin login error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie) as { id: string; email: string; name: string };
  } catch {
    return null;
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
