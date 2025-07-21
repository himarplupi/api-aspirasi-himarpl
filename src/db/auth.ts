import { db } from "./index";
import { users, NewUser } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { createToken } from "../utils/jwt";

// Fungsi untuk mendaftarkan pengguna baru
export async function registerUser(userData: {
  email: string;
  nama: string;
  password: string;
  role?: string;
}) {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Siapkan data user baru
    const allowedRoles = ["admin", "superadmin"] as const;
    type Role = (typeof allowedRoles)[number];
    let finalRole: Role = "admin"; // default

    if (userData.role && allowedRoles.includes(userData.role as Role)) {
      finalRole = userData.role as Role;
    }

    const newUser: NewUser = {
      email: userData.email,
      nama: userData.nama,
      password: hashedPassword,
      role: finalRole,
    };

    // Simpan user ke database
    await db.insert(users).values(newUser);

    // Ambil user yang baru dibuat (tanpa password)
    const createdUser = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, userData.email));

    if (createdUser.length === 0) {
      throw new Error("Gagal membuat pengguna");
    }

    // Buat token JWT menggunakan utility
    const token = createToken({
      id: createdUser[0].id,
      email: createdUser[0].email,
      role: createdUser[0].role,
    });

    return {
      status: "success",
      token,
      //   user: createdUser[0]
    };
    /* eslint-disable @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      throw new Error("Email sudah terdaftar");
    }
    throw error;
  }
}

// Fungsi untuk login pengguna
export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  try {
    // Cari user berdasarkan email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, credentials.email));

    if (userResult.length === 0) {
      throw new Error("Email atau password salah");
    }

    const user = userResult[0];

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(
      credentials.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new Error("Email atau password salah");
    }

    // Buat token JWT menggunakan utility
    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      status: "success",
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
      },
    };
  } catch (error) {
    throw error;
  }
}
