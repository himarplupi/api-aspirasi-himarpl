import { db } from "./index"; // Adjust import path as needed
import { aspirasi } from "./schema";
import { eq } from "drizzle-orm";

// Interface untuk input insert aspirasi
export interface InsertAspirasiInput {
  aspirasi: string;
  penulis?: string;
  kategori?: "prodi" | "hima";
}

// Function untuk insert aspirasi
export async function insertAspirasi(data: InsertAspirasiInput) {
  try {
    const currentDate = new Date().toISOString();

    // Secara eksplisit exclude id_aspirasi
    const result = await db
      .insert(aspirasi)
      .values({
        aspirasi: data.aspirasi,
        penulis: data.penulis || null,
        kategori: data.kategori || null,
        c_date: currentDate,
      }) // id_aspirasi tidak disebutkan, sehingga tidak dikirim
      .returning();

    return {
      success: true,
      data: result[0],
      message: "Aspirasi berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error inserting aspirasi:", error);
    return {
      success: false,
      error: "Gagal menambahkan aspirasi",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Function untuk delete aspirasi
export async function deleteAspirasi(id_aspirasi: number) {
  try {
    const result = await db
      .delete(aspirasi)
      .where(eq(aspirasi.id_aspirasi, id_aspirasi))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: "Aspirasi tidak ditemukan",
      };
    }

    return {
      success: true,
      data: result[0],
      message: "Aspirasi berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting aspirasi:", error);
    return {
      success: false,
      error: "Gagal menghapus aspirasi",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Function untuk get all aspirasi (bonus)
export async function getAllAspirasi() {
  try {
    const result = await db.select().from(aspirasi).orderBy(aspirasi.c_date);

    return {
      success: true,
      data: result,
      message: "Data aspirasi berhasil diambil",
    };
  } catch (error) {
    console.error("Error getting all aspirasi:", error);
    return {
      success: false,
      error: "Gagal mengambil data aspirasi",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Function untuk get aspirasi by id (bonus)
export async function getAspirasiById(id_aspirasi: number) {
  try {
    const result = await db
      .select()
      .from(aspirasi)
      .where(eq(aspirasi.id_aspirasi, id_aspirasi));

    if (result.length === 0) {
      return {
        success: false,
        error: "Aspirasi tidak ditemukan",
      };
    }

    return {
      success: true,
      data: result[0],
      message: "Data aspirasi berhasil diambil",
    };
  } catch (error) {
    console.error("Error getting aspirasi by id:", error);
    return {
      success: false,
      error: "Gagal mengambil data aspirasi",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
