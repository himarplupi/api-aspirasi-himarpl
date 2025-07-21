// app/api/display-aspirasi/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getDisplayedAspirasi } from "@/db/landingpg";
import { applyCors, handleOptions } from "@/utils/cors";

// OPTIONS - preflight
export async function OPTIONS() {
  return handleOptions();
}

// GET - Ambil semua aspirasi atau hanya yang displayed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const displayedOnly = searchParams.get("displayed");

    const result = await getDisplayedAspirasi();

    return applyCors(
      NextResponse.json({ success: true, data: result }, { status: 200 }),
    );
  } catch (error) {
    console.error("Error in GET display-aspirasi:", error);
    return applyCors(
      NextResponse.json(
        { success: false, error: "Terjadi kesalahan server" },
        { status: 500 },
      ),
    );
  }
}
