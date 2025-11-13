import { db } from "../db";
import { users } from "./schema";
import { desc } from "drizzle-orm";

export async function getAllUsers() {
  return await db.select().from(users).orderBy(desc(users.id));
}
