import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { users, NewUser } from "@/db/schema";
import bcrypt from "bcrypt";
import { createToken } from "@/utils/jwt";
import { sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nama, password } = body;

    // Validasi input
    if (!email || !nama || !password) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email, nama, dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada user di database
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);

    const totalUsers = userCount[0].count;

    // Jika sudah ada user, tolak request
    if (totalUsers >= 1) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Inisialisasi superadmin gagal. Sudah ada user di sistem. Gunakan endpoint /api/auth/register untuk registrasi user baru.",
        },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat superadmin pertama
    const newSuperadmin: NewUser = {
      email: email,
      nama: nama,
      password: hashedPassword,
      role: "superadmin",
    };

    // Simpan ke database
    await db.insert(users).values(newSuperadmin);

    // Ambil user yang baru dibuat
    const [createdUser] = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(sql`${users.email} = ${email}`);

    if (!createdUser) {
      throw new Error("Gagal membuat superadmin");
    }

    // Buat token JWT
    const token = createToken({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Superadmin pertama berhasil dibuat",
        token,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          nama: createdUser.nama,
          role: createdUser.role,
        },
      },
      { status: 201 }
    );
    /* eslint-disable @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    console.error("Error creating initial superadmin:", error);

    const message = error.message || "Terjadi kesalahan saat membuat superadmin";
    const statusCode =
      error.message && error.message.includes("UNIQUE constraint failed") ? 409 : 500;

    return NextResponse.json(
      {
        status: "error",
        message: statusCode === 409 ? "Email sudah terdaftar" : message,
      },
      { status: statusCode }
    );
  }
}
