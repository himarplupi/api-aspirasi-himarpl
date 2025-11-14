import { db } from "./index"; // Adjust import path as needed
import { aspirasi } from "./schema";
import { eq, desc, like, sql } from "drizzle-orm";

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

// Function untuk get all aspirasi dengan pagination support
export async function getAllAspirasi(param?: string) {
  try {
    // CASE 1: Tanpa parameter -> ambil semua data
    if (!param) {
      const result = await db.select().from(aspirasi).orderBy(desc(aspirasi.c_date));

      return {
        success: true,
        count: result.length,
        data: result,
        message: "Data aspirasi berhasil diambil",
      };
    }

    // CASE 2: Format "start,end" -> ambil paginasi
    if (/^\d+,\d+$/.test(param)) {
      const [start, end] = param.split(",").map(Number);
      const limit = end - start + 1;

      const result = await db
        .select()
        .from(aspirasi)
        .orderBy(desc(aspirasi.c_date))
        .limit(limit)
        .offset(start - 1);

      // Ambil total count tanpa pagination
      const countAll = await db
        .select({ count: sql<number>`count(*)` })
        .from(aspirasi)
        .then((res) => res[0].count);

      return {
        success: true,
        count: countAll,
        data: result,
        message: "Data aspirasi berhasil diambil",
      };
    }

    // CASE 3: Keyword pencarian
    const result = await db
      .select()
      .from(aspirasi)
      .where(like(aspirasi.aspirasi, `%${param}%`))
      .orderBy(desc(aspirasi.c_date));

    return {
      success: true,
      count: result.length,
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

// Function untuk get aspirasi by id
export async function getAspirasiById(id_aspirasi: number) {
  try {
    const result = await db.select().from(aspirasi).where(eq(aspirasi.id_aspirasi, id_aspirasi));

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
