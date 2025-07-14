import { db } from "../db";
import { users } from "./schema";

export async function getAllUsers() {
  return await db.select().from(users);
}
