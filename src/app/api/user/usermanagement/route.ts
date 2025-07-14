import { NextRequest, NextResponse } from "next/server";
import {
  getAllUsersExceptSelf,
  getUserById,
  deleteUser,
  updateUserRole,
  promoteToSuperadmin,
  registerUser,
  UserServiceResponse
} from "@/db/userservice";
import { validateToken } from "@/utils/jwt";
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

// Helper untuk memvalidasi role superadmin
function validateSuperadmin(role: string) {
  if (role !== 'superadmin') {
    return {
      error: "Akses ditolak: Hanya superadmin yang dapat mengakses endpoint ini",
      status: 403
    };
  }
  return null;
}

// GET: Mengambil semua user atau user berdasarkan ID
export async function GET(req: NextRequest) {
  const { payload, error } = await getUserFromRequest(req);
  if (error) {
    return applyCors(NextResponse.json({ error }, { status: 401 }));
  }

  // Validasi role superadmin
  const roleValidation = validateSuperadmin(payload!.role);
  if (roleValidation) {
    return applyCors(
      NextResponse.json(
        { error: roleValidation.error },
        { status: roleValidation.status }
      )
    );
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");

  try {
    let result: UserServiceResponse;

    if (userId) {
      // Mengambil user berdasarkan ID
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        return applyCors(
          NextResponse.json(
            { error: "ID user tidak valid" },
            { status: 400 }
          )
        );
      }

      result = await getUserById(userIdNum, payload!.id, payload!.role);
    } else {
      // Mengambil semua user
      result = await getAllUsersExceptSelf(payload!.id, payload!.role);
    }

    if (!result.success) {
      return applyCors(
        NextResponse.json(
          { error: result.error },
          { status: result.error?.includes("tidak ditemukan") ? 404 : 400 }
        )
      );
    }

    return applyCors(
      NextResponse.json({
        success: true,
        data: result.data,
        message: result.message,
        currentUserRole: result.currentUserRole
      })
    );

  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return applyCors(
      NextResponse.json(
        { error: "Terjadi kesalahan server" },
        { status: 500 }
      )
    );
  }
}

// POST: Register user baru
export async function POST(req: NextRequest) {
  const { payload, error } = await getUserFromRequest(req);
  if (error) {
    return applyCors(NextResponse.json({ error }, { status: 401 }));
  }

  // Validasi role 
  const roleValidation = validateSuperadmin(payload!.role);
  if (roleValidation) {
    return applyCors(
      NextResponse.json(
        { error: roleValidation.error },
        { status: roleValidation.status }
      )
    );
  }

  try {
    const body = await req.json();
    const { email, nama, password, role } = body;

    // Validasi input
    if (!email || !nama || !password) {
      return applyCors(
        NextResponse.json(
          { error: "Email, nama, dan password harus disediakan" },
          { status: 400 }
        )
      );
    }

    // Validasi role jika disediakan
    if (role && !['admin', 'superadmin'].includes(role)) {
      return applyCors(
        NextResponse.json(
          { error: "Role harus 'admin' atau 'superadmin'" },
          { status: 400 }
        )
      );
    }

    const result = await registerUser(
      { email, nama, password, role },
      payload!.role
    );

    if (!result.success) {
      return applyCors(
        NextResponse.json(
          { error: result.error },
          { status: result.error?.includes("sudah terdaftar") ? 409 : 400 }
        )
      );
    }

    return applyCors(
      NextResponse.json({
        success: true,
        data: result.data,
        message: result.message,
        currentUserRole: result.currentUserRole
      })
    );

  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return applyCors(
      NextResponse.json(
        { error: "Terjadi kesalahan server" },
        { status: 500 }
      )
    );
  }
}

// DELETE: Menghapus user berdasarkan ID
export async function DELETE(req: NextRequest) {
  const { payload, error } = await getUserFromRequest(req);
  if (error) {
    return applyCors(NextResponse.json({ error }, { status: 401 }));
  }

  // Validasi role superadmin
  const roleValidation = validateSuperadmin(payload!.role);
  if (roleValidation) {
    return applyCors(
      NextResponse.json(
        { error: roleValidation.error },
        { status: roleValidation.status }
      )
    );
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return applyCors(
      NextResponse.json(
        { error: "ID user harus disediakan" },
        { status: 400 }
      )
    );
  }

  const userIdNum = parseInt(userId);
  if (isNaN(userIdNum)) {
    return applyCors(
      NextResponse.json(
        { error: "ID user tidak valid" },
        { status: 400 }
      )
    );
  }

  try {
    const result = await deleteUser(userIdNum, payload!.id, payload!.role);

    if (!result.success) {
      return applyCors(
        NextResponse.json(
          { error: result.error },
          { status: result.error?.includes("tidak ditemukan") ? 404 : 400 }
        )
      );
    }

    return applyCors(
      NextResponse.json({
        success: true,
        data: result.data,
        message: result.message,
        currentUserRole: result.currentUserRole
      })
    );

  } catch (error) {
    console.error("Error in DELETE /api/users:", error);
    return applyCors(
      NextResponse.json(
        { error: "Terjadi kesalahan server" },
        { status: 500 }
      )
    );
  }
}

// PUT: Mengupdate role user atau promote ke superadmin
export async function PUT(req: NextRequest) {
  const { payload, error } = await getUserFromRequest(req);
  if (error) {
    return applyCors(NextResponse.json({ error }, { status: 401 }));
  }

  // Validasi role superadmin
  const roleValidation = validateSuperadmin(payload!.role);
  if (roleValidation) {
    return applyCors(
      NextResponse.json(
        { error: roleValidation.error },
        { status: roleValidation.status }
      )
    );
  }

  try {
    const body = await req.json();
    const { userId, action } = body;

    if (!userId) {
      return applyCors(
        NextResponse.json(
          { error: "userId harus disediakan" },
          { status: 400 }
        )
      );
    }

    if (action !== 'promote') {
      return applyCors(
        NextResponse.json(
          { error: "Aksi tidak valid. Hanya 'promote' yang diizinkan." },
          { status: 400 }
        )
      );
    }

    const result = await promoteToSuperadmin(
      parseInt(userId),
      payload!.id,
      payload!.role
    );

    if (!result.success) {
      return applyCors(
        NextResponse.json(
          { error: result.error },
          { status: result.error?.includes("tidak ditemukan") ? 404 : 400 }
        )
      );
    }

    return applyCors(
      NextResponse.json({
        success: true,
        data: result.data,
        message: result.message,
        currentUserRole: result.currentUserRole
      })
    );

  } catch (error) {
    console.error("Error in PUT /api/users:", error);
    return applyCors(
      NextResponse.json(
        { error: "Terjadi kesalahan server" },
        { status: 500 }
      )
    );
  }
}
