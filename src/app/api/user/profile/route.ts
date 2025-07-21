// app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUserName, updateUserPassword } from "@/db/profile";
import { validateToken } from "@/utils/jwt";
import { applyCors, handleOptions } from "@/utils/cors";

// OPTIONS - preflight
export async function OPTIONS() {
  return handleOptions();
}

// GET - Ambil data user dari JWT
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return applyCors(
        NextResponse.json(
          { success: false, error: "Token tidak ditemukan" },
          { status: 401 },
        ),
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const { isValid, payload, error, newToken } = validateToken(token);

    if (!isValid || !payload) {
      return applyCors(
        NextResponse.json(
          { success: false, error: error || "Token tidak valid" },
          { status: 401 },
        ),
      );
    }

    const user = await getUserById(payload.id);

    if (!user) {
      return applyCors(
        NextResponse.json(
          { success: false, error: "User tidak ditemukan" },
          { status: 404 },
        ),
      );
    }

    const response = NextResponse.json(
      { success: true, data: user },
      { status: 200 },
    );
    if (newToken) response.headers.set("x-refreshed-token", newToken);
    return applyCors(response);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return applyCors(
      NextResponse.json(
        { success: false, error: "Terjadi kesalahan server" },
        { status: 500 },
      ),
    );
  }
}

// PUT - Update nama atau password
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return applyCors(
        NextResponse.json(
          { success: false, error: "Token tidak ditemukan" },
          { status: 401 },
        ),
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const { isValid, payload, error, newToken } = validateToken(token);

    if (!isValid || !payload) {
      return applyCors(
        NextResponse.json(
          { success: false, error: error || "Token tidak valid" },
          { status: 401 },
        ),
      );
    }

    const body = await req.json();

    let updatedUser;
    if (body.newName) {
      updatedUser = await updateUserName(payload.id, body.newName);
    } else if (body.oldPassword && body.newPassword) {
      try {
        updatedUser = await updateUserPassword(
          payload.id,
          body.oldPassword,
          body.newPassword,
        );
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } catch (e: any) {
        return applyCors(
          NextResponse.json(
            { success: false, error: e.message },
            { status: 400 },
          ),
        );
      }
    } else {
      return applyCors(
        NextResponse.json(
          { success: false, error: "Input tidak valid" },
          { status: 400 },
        ),
      );
    }

    const response = NextResponse.json(
      { success: true, data: updatedUser },
      { status: 200 },
    );
    if (newToken) response.headers.set("x-refreshed-token", newToken);
    return applyCors(response);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return applyCors(
      NextResponse.json(
        { success: false, error: "Terjadi kesalahan server" },
        { status: 500 },
      ),
    );
  }
}
