// db/aspirasiDisplay.ts

import { db } from "./index";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { aspirasi, displayAspirasi } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Ambil semua aspirasi (dari tabel `aspirasi`)
// export async function getAllAspirasi() {
//   const result = await db.select().from(aspirasi).orderBy(aspirasi.id_aspirasi);
//   return result;
// }

// Ambil hanya aspirasi yang berstatus `displayed` (dari tabel `display_aspirasi`)
export async function getDisplayedAspirasi() {
  const result = await db
    .select()
    .from(displayAspirasi)
    .where(eq(displayAspirasi.status, "displayed"))
    .orderBy(desc(displayAspirasi.id_dispirasi));
  return result;
}
