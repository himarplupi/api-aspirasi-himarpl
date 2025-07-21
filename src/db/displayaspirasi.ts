import { db } from "./index"; // sesuaikan path ini ke db instance kamu
import { displayAspirasi, aspirasi } from "./schema";
import { eq, like, sql } from "drizzle-orm";
import { DisplayAspirasi } from "./schema";

// Helper function untuk mendapatkan timestamp saat ini dalam format ISO
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export async function getDisplayAspirasi(param?: string): Promise<{
  count: number;
  data: DisplayAspirasi[];
}> {
  // CASE 1: Tanpa parameter -> ambil semua data
  if (!param) {
    const data = await db.select().from(displayAspirasi);
    return {
      count: data.length,
      data,
    };
  }

  // CASE 2: Format "start,end" -> ambil paginasi
  if (/^\d+,\d+$/.test(param)) {
    const [start, end] = param.split(",").map(Number);
    const limit = end - start + 1;

    const data = await db
      .select()
      .from(displayAspirasi)
      .limit(limit)
      .offset(start - 1);

    // Ambil total count tanpa pagination
    const countAll = await db
      .select({ count: sql<number>`count(*)` })
      .from(displayAspirasi)
      .then((res) => res[0].count);

    return {
      count: countAll,
      data,
    };
  }

  // CASE 3: Keyword pencarian
  const data = await db
    .select()
    .from(displayAspirasi)
    .where(like(displayAspirasi.aspirasi, `%${param}%`));

  return {
    count: data.length,
    data,
  };
}

// INSERT displayAspirasi dari id_aspirasi dengan ilustrasi
export async function insertDisplayAspirasi(
  id_aspirasi: number,
  kategori: "prodi" | "hima",
  added_by: string,
  status: "displayed" | "hidden",
  ilustrasiFilename?: string | null,
): Promise<DisplayAspirasi | null> {
  try {
    const [aspirasiData] = await db
      .select()
      .from(aspirasi)
      .where(eq(aspirasi.id_aspirasi, id_aspirasi));

    if (!aspirasiData) {
      console.error(`Aspirasi dengan ID ${id_aspirasi} tidak ditemukan`);
      return null;
    }

    const [inserted] = await db
      .insert(displayAspirasi)
      .values({
        aspirasi: aspirasiData.aspirasi,
        penulis: aspirasiData.penulis ?? "",
        ilustrasi: ilustrasiFilename || null, // Simpan nama file ilustrasi
        kategori,
        added_by,
        last_updated: getCurrentTimestamp(),
        status,
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error("Error inserting display aspirasi:", error);
    return null;
  }
}

// DELETE displayAspirasi by ID
export async function deleteDisplayAspirasi(
  id_dispirasi: number,
): Promise<boolean> {
  try {
    const deleted = await db
      .delete(displayAspirasi)
      .where(eq(displayAspirasi.id_dispirasi, id_dispirasi));

    return deleted.rowsAffected > 0;
  } catch (error) {
    console.error("Error deleting display aspirasi:", error);
    return false;
  }
}

// UPDATE status (displayed / hidden)
export async function updateDisplayAspirasiStatus(
  id_dispirasi: number,
  status: "displayed" | "hidden",
): Promise<boolean> {
  try {
    const updated = await db
      .update(displayAspirasi)
      .set({
        status,
        last_updated: getCurrentTimestamp(),
      })
      .where(eq(displayAspirasi.id_dispirasi, id_dispirasi));

    return updated.rowsAffected > 0;
  } catch (error) {
    console.error("Error updating display aspirasi status:", error);
    return false;
  }
}

// UPDATE kategori (prodi / hima)
export async function updateDisplayAspirasiKategori(
  id_dispirasi: number,
  kategori: "prodi" | "hima",
): Promise<boolean> {
  try {
    const updated = await db
      .update(displayAspirasi)
      .set({
        kategori,
        last_updated: getCurrentTimestamp(),
      })
      .where(eq(displayAspirasi.id_dispirasi, id_dispirasi));

    return updated.rowsAffected > 0;
  } catch (error) {
    console.error("Error updating display aspirasi kategori:", error);
    return false;
  }
}

// UPDATE isi aspirasi dan ilustrasi
export async function updateDisplayAspirasiText(
  id_dispirasi: number,
  aspirasiBaru: string,
  ilustrasiFilename?: string | null,
): Promise<boolean> {
  try {
    // Prepare update data
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const updateData: any = {
      aspirasi: aspirasiBaru,
      last_updated: getCurrentTimestamp(),
    };

    // Only update ilustrasi if a new filename is provided
    if (ilustrasiFilename !== undefined) {
      updateData.ilustrasi = ilustrasiFilename;
    }

    const updated = await db
      .update(displayAspirasi)
      .set(updateData)
      .where(eq(displayAspirasi.id_dispirasi, id_dispirasi));

    return updated.rowsAffected > 0;
  } catch (error) {
    console.error("Error updating display aspirasi text:", error);
    return false;
  }
}

// Function to get illustration filename by id_dispirasi (helpful for file management)
export async function getDisplayAspirasiIlustrasi(
  id_dispirasi: number,
): Promise<string | null> {
  try {
    const [result] = await db
      .select({ ilustrasi: displayAspirasi.ilustrasi })
      .from(displayAspirasi)
      .where(eq(displayAspirasi.id_dispirasi, id_dispirasi));

    return result?.ilustrasi || null;
  } catch (error) {
    console.error("Error getting illustration filename:", error);
    return null;
  }
}

// Function to update only illustration filename
export async function updateDisplayAspirasiIlustrasi(
  id_dispirasi: number,
  ilustrasiFilename: string | null,
): Promise<boolean> {
  try {
    const updated = await db
      .update(displayAspirasi)
      .set({
        ilustrasi: ilustrasiFilename,
        last_updated: getCurrentTimestamp(),
      })
      .where(eq(displayAspirasi.id_dispirasi, id_dispirasi));

    return updated.rowsAffected > 0;
  } catch (error) {
    console.error("Error updating display aspirasi illustration:", error);
    return false;
  }
}

// Function to get complete display aspirasi data by ID (useful for validation)
export async function getDisplayAspirasiById(
  id_dispirasi: number,
): Promise<DisplayAspirasi | null> {
  try {
    const [result] = await db
      .select()
      .from(displayAspirasi)
      .where(eq(displayAspirasi.id_dispirasi, id_dispirasi));

    return result || null;
  } catch (error) {
    console.error("Error getting display aspirasi by ID:", error);
    return null;
  }
}
