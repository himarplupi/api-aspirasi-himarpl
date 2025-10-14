import { NextRequest, NextResponse } from "next/server";
import { insertAspirasi, deleteAspirasi, getAllAspirasi, getAspirasiById } from "@/db/aspirasi";
import { validateToken } from "@/utils/jwt";
import { applyCors, handleOptions } from "@/utils/cors";
import { applyPostAspirasiRateLimit } from "@/utils/rateLimiter";

// OPTIONS - Handle preflight CORS
export async function OPTIONS() {
  return handleOptions();
}

// GET - Mendapatkan semua aspirasi atau aspirasi by id
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return applyCors(
        NextResponse.json(
          { success: false, error: "Token tidak ditemukan di header" },
          { status: 401 }
        )
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isValid, error, payload, newToken } = validateToken(token);

    if (!isValid) {
      return applyCors(
        NextResponse.json({ success: false, error: error || "Token tidak valid" }, { status: 401 })
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let result;

    if (id) {
      const idNumber = parseInt(id);
      if (isNaN(idNumber)) {
        return applyCors(
          NextResponse.json({ success: false, error: "ID aspirasi tidak valid" }, { status: 400 })
        );
      }
      result = await getAspirasiById(idNumber);
    } else {
      result = await getAllAspirasi();
    }

    const response = NextResponse.json(result, {
      status: result.success ? 200 : 404,
    });

    if (newToken) {
      response.headers.set("x-refreshed-token", newToken);
    }

    return applyCors(response);
  } catch (error) {
    console.error("Error in GET aspirasi:", error);
    return applyCors(
      NextResponse.json(
        {
          success: false,
          error: "Terjadi kesalahan server",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      )
    );
  }
}

// POST - Menambahkan aspirasi baru
export async function POST(request: NextRequest) {
  try {
    // Terapkan rate limit
    const rateLimitResponse = await applyPostAspirasiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse; // Return response rate limit jika terpicu
    }

    const body = await request.json();

    if (!body.aspirasi || typeof body.aspirasi !== "string") {
      return applyCors(
        NextResponse.json(
          {
            success: false,
            error: "Field aspirasi harus diisi dan berupa string",
          },
          { status: 400 }
        )
      );
    }

    if (body.penulis && typeof body.penulis !== "string") {
      return applyCors(
        NextResponse.json(
          { success: false, error: "Field penulis harus berupa string" },
          { status: 400 }
        )
      );
    }

    if (body.penulis && body.penulis.length > 100) {
      return applyCors(
        NextResponse.json(
          { success: false, error: "Field penulis maksimal 100 karakter" },
          { status: 400 }
        )
      );
    }

    // Validasi kategori jika ada
    if (body.kategori && !["prodi", "hima"].includes(body.kategori)) {
      return applyCors(
        NextResponse.json(
          { success: false, error: "Kategori harus berupa 'prodi' atau 'hima'" },
          { status: 400 }
        )
      );
    }

    const result = await insertAspirasi({
      aspirasi: body.aspirasi.trim(),
      penulis: body.penulis?.trim() || null,
      kategori: body.kategori || null,
    });

    return applyCors(
      NextResponse.json(result, {
        status: result.success ? 201 : 400,
      })
    );
  } catch (error) {
    console.error("Error in POST aspirasi:", error);
    return applyCors(
      NextResponse.json(
        {
          success: false,
          error: "Terjadi kesalahan server",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      )
    );
  }
}

// DELETE - Menghapus aspirasi berdasarkan id
export async function DELETE(request: NextRequest) {
  try {
    // Validasi JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return applyCors(
        NextResponse.json(
          { success: false, error: "Token tidak ditemukan di header" },
          { status: 401 }
        )
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isValid, error, payload, newToken } = validateToken(token);

    if (!isValid) {
      return applyCors(
        NextResponse.json({ success: false, error: error || "Token tidak valid" }, { status: 401 })
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return applyCors(
        NextResponse.json(
          { success: false, error: "ID aspirasi harus disertakan" },
          { status: 400 }
        )
      );
    }

    const idNumber = parseInt(id);
    if (isNaN(idNumber)) {
      return applyCors(
        NextResponse.json({ success: false, error: "ID aspirasi tidak valid" }, { status: 400 })
      );
    }

    const result = await deleteAspirasi(idNumber);

    const response = NextResponse.json(result, {
      status: result.success ? 200 : 404,
    });

    // Tambahkan token baru jika ada refresh token
    if (newToken) {
      response.headers.set("x-refreshed-token", newToken);
    }

    return applyCors(response);
  } catch (error) {
    console.error("Error in DELETE aspirasi:", error);
    return applyCors(
      NextResponse.json(
        {
          success: false,
          error: "Terjadi kesalahan server",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      )
    );
  }
}
