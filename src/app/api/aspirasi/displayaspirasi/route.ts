import { NextRequest, NextResponse } from "next/server";
import {
  insertDisplayAspirasi,
  deleteDisplayAspirasi,
  updateDisplayAspirasiKategori,
  updateDisplayAspirasiStatus,
  updateDisplayAspirasiText,
  getDisplayAspirasi,
  getDisplayAspirasiIlustrasi,
  updateDisplayAspirasiIlustrasi,
} from "@/db/displayaspirasi";
import { validateToken } from "@/utils/jwt";
import { uploadIllustration, deleteIllustration, updateIllustration } from "@/utils/supabase";
import { applyCors, handleOptions } from "@/utils/cors";

export async function OPTIONS() {
  return handleOptions();
}

// Helper untuk ambil dan validasi JWT
async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Authorization header missing or malformed" };
  }

  const token = authHeader.split(" ")[1];
  const validation = validateToken(token);
  if (!validation.isValid || !validation.payload) {
    return { error: validation.error || "Unauthorized" };
  }

  return { payload: validation.payload };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const param = searchParams.get("param") ?? undefined;

  try {
    const { count, data } = await getDisplayAspirasi(param);

    return applyCors(
      NextResponse.json({
        count,
        data,
      })
    );
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    return applyCors(NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 }));
  }
}

// POST: Insert data + upload gambar
export async function POST(req: NextRequest) {
  const { payload, error } = await getUserFromRequest(req);
  if (error) return applyCors(NextResponse.json({ error }, { status: 401 }));

  const form = await req.formData();
  const id_aspirasi = parseInt(form.get("id_aspirasi") as string);
  const kategori = form.get("kategori") as "prodi" | "hima";
  const status = form.get("status") as "displayed" | "hidden";
  const ilustrasiFile = form.get("ilustrasi") as File | null;

  let ilustrasiFilename: string | null = null;

  // Simpan file jika ada
  if (ilustrasiFile && ilustrasiFile.size > 0) {
    try {
      ilustrasiFilename = await uploadIllustration(ilustrasiFile);

      if (!ilustrasiFilename) {
        return applyCors(
          NextResponse.json(
            { error: "Gagal mengupload file ilustrasi ke Supabase" },
            { status: 500 }
          )
        );
      }
    } catch (writeError) {
      console.error("Error uploading file:", writeError);
      return applyCors(
        NextResponse.json({ error: "Gagal menyimpan file ilustrasi" }, { status: 500 })
      );
    }
  }

  try {
    const inserted = await insertDisplayAspirasi(
      id_aspirasi,
      kategori,
      payload!.email,
      status,
      ilustrasiFilename
    );
    if (!inserted)
      return applyCors(NextResponse.json({ error: "Gagal menambahkan aspirasi" }, { status: 500 }));

    return applyCors(NextResponse.json({ message: "Berhasil ditambahkan", data: inserted }));
  } catch (dbError) {
    console.error("Database error:", dbError);

    // Jika ada error database dan file sudah tersimpan, hapus file dari Supabase
    if (ilustrasiFilename) {
      await deleteIllustration(ilustrasiFilename);
    }

    return applyCors(NextResponse.json({ error: "Gagal menambahkan aspirasi" }, { status: 500 }));
  }
}

// PUT: Update status / kategori / ilustrasi
export async function PUT(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { payload, error } = await getUserFromRequest(req);
  if (error) return applyCors(NextResponse.json({ error }, { status: 401 }));

  const form = await req.formData();
  const id_dispirasi = parseInt(form.get("id_dispirasi") as string);
  const action = form.get("action") as string;

  let result: boolean = false;

  if (action === "status") {
    const status = form.get("status") as "displayed" | "hidden";
    result = await updateDisplayAspirasiStatus(id_dispirasi, status);
  } else if (action === "kategori") {
    const kategori = form.get("kategori") as "prodi" | "hima";
    result = await updateDisplayAspirasiKategori(id_dispirasi, kategori);
  } else if (action === "ilustrasi") {
    const newText = form.get("aspirasi") as string;
    const ilustrasiFile = form.get("ilustrasi") as File | null;

    let ilustrasiFilename: string | null = null;

    if (ilustrasiFile && ilustrasiFile.size > 0) {
      try {
        ilustrasiFilename = await uploadIllustration(ilustrasiFile);

        if (!ilustrasiFilename) {
          return applyCors(
            NextResponse.json(
              { error: "Gagal mengupload file ilustrasi ke Supabase" },
              { status: 500 }
            )
          );
        }
      } catch (writeError) {
        console.error("Error uploading file:", writeError);
        return applyCors(
          NextResponse.json({ error: "Gagal menyimpan file ilustrasi" }, { status: 500 })
        );
      }
    }

    result = await updateDisplayAspirasiText(id_dispirasi, newText, ilustrasiFilename);
  } else if (action === "update_image") {
    // NEW: Logic untuk update image saja
    const ilustrasiFile = form.get("ilustrasi") as File | null;

    if (!ilustrasiFile || ilustrasiFile.size === 0) {
      return applyCors(
        NextResponse.json({ error: "File ilustrasi harus disediakan" }, { status: 400 })
      );
    }

    try {
      // 1. Ambil nama file ilustrasi lama
      const oldIlustrasiFilename = await getDisplayAspirasiIlustrasi(id_dispirasi);

      // 2. Upload file baru menggunakan updateIllustration helper
      const newIlustrasiFilename = await updateIllustration(oldIlustrasiFilename, ilustrasiFile);

      if (!newIlustrasiFilename) {
        return applyCors(
          NextResponse.json({ error: "Gagal mengupload ilustrasi baru" }, { status: 500 })
        );
      }

      // 3. Update database dengan nama file baru
      result = await updateDisplayAspirasiIlustrasi(id_dispirasi, newIlustrasiFilename);

      if (!result) {
        // Jika gagal update database, hapus file baru yang sudah terupload
        await deleteIllustration(newIlustrasiFilename);
      }
    } catch (fileError) {
      console.error("Error updating illustration:", fileError);
      return applyCors(NextResponse.json({ error: "Gagal mengupdate ilustrasi" }, { status: 500 }));
    }
  }

  if (!result) return applyCors(NextResponse.json({ error: "Update gagal" }, { status: 500 }));

  return applyCors(NextResponse.json({ message: "Update berhasil" }));
}

// DELETE: Delete by id_dispirasi
export async function DELETE(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { payload, error } = await getUserFromRequest(req);
  if (error) return applyCors(NextResponse.json({ error }, { status: 401 }));

  const { searchParams } = new URL(req.url);
  const id_dispirasi = parseInt(searchParams.get("id") || "0");
  if (!id_dispirasi) {
    return applyCors(NextResponse.json({ error: "ID tidak valid" }, { status: 400 }));
  }

  try {
    // Ambil nama file ilustrasi sebelum menghapus dari database
    const ilustrasiFilename = await getDisplayAspirasiIlustrasi(id_dispirasi);

    // Hapus dari database
    const result = await deleteDisplayAspirasi(id_dispirasi);

    if (!result) {
      return applyCors(NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 }));
    }

    // Hapus file ilustrasi jika ada dari Supabase
    if (ilustrasiFilename) {
      await deleteIllustration(ilustrasiFilename);
    }

    return applyCors(NextResponse.json({ message: "Berhasil dihapus" }));
  } catch (error) {
    console.error("Error deleting display aspirasi:", error);
    return applyCors(NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 }));
  }
}
