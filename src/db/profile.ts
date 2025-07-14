// db/profile.ts

import { db } from "./index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Ambil profil user berdasarkan ID dari token
export async function getUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// Update nama user berdasarkan ID
export async function updateUserName(id: number, newName: string) {
  await db.update(users).set({ nama: newName }).where(eq(users.id, id));
  const updatedUser = await getUserById(id);
  return updatedUser;
}

// Update password user (cek password lama dulu)
export async function updateUserPassword(
  id: number,
  oldPassword: string,
  newPassword: string
) {
  const user = await getUserById(id);
  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Password lama tidak cocok");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await db
    .update(users)
    .set({ password: hashedNewPassword })
    .where(eq(users.id, id));
  const updatedUser = await getUserById(id);
  return updatedUser;
}
