import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/db/auth";
import { applyCors, handleOptions } from "@/utils/cors";
import { applyPostAspirasiRateLimit } from "@/utils/rateLimiter";
export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await applyPostAspirasiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse; // Return response rate limit jika terpicu
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return applyCors(
        NextResponse.json(
          { status: "error", message: "Email dan password diperlukan" },
          { status: 400 },
        ),
      );
    }

    const result = await loginUser({ email, password });
    console.log("berhasil login", result);

    return applyCors(NextResponse.json(result));
    /* eslint-disable @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    console.error("Login error:", error);
    return applyCors(
      NextResponse.json(
        {
          status: "error",
          message: error.message || "Terjadi kesalahan saat login",
        },
        { status: 401 },
      ),
    );
  }
}
