import { db } from "./index";
import { users, User, NewUser } from './schema';
import { eq, and, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createToken } from '@/utils/jwt';

// Interface untuk user tanpa password
export interface UserWithoutPassword extends Omit<User, 'password'> {}

// Interface untuk response service
export interface UserServiceResponse {
  success: boolean;
  data?: UserWithoutPassword | UserWithoutPassword[];
  message?: string;
  error?: string;
  currentUserRole?: string;
}

/**
 * Mengambil semua user kecuali dirinya sendiri - menampilkan semua role
 * @param currentUserId - ID user yang sedang login
 * @param currentUserRole - Role user yang sedang login
 * @returns Promise<UserServiceResponse>
 */
export async function getAllUsersExceptSelf(
  currentUserId: number,
  currentUserRole: string
): Promise<UserServiceResponse> {
  try {
    // Query untuk mengambil semua user kecuali user yang sedang login
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(ne(users.id, currentUserId)); // Hanya kecuali diri sendiri

    return {
      success: true,
      data: result,
      message: `Berhasil mengambil ${result.length} data user`,
      currentUserRole: currentUserRole
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Gagal mengambil data user: ${error.message}`,
      currentUserRole: currentUserRole
    };
  }
}

/**
 * Mengambil user berdasarkan ID (kecuali password)
 * @param userId - ID user yang akan diambil
 * @param currentUserId - ID user yang sedang login
 * @param currentUserRole - Role user yang sedang login
 * @returns Promise<UserServiceResponse>
 */
export async function getUserById(
  userId: number,
  currentUserId: number,
  currentUserRole: string
): Promise<UserServiceResponse> {
  try {
    // Cek apakah user mencoba mengakses data diri sendiri
    if (userId === currentUserId) {
      return {
        success: false,
        error: "Tidak dapat mengakses data diri sendiri melalui endpoint ini",
        currentUserRole: currentUserRole
      };
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return {
        success: false,
        error: "User tidak ditemukan",
        currentUserRole: currentUserRole
      };
    }

    return {
      success: true,
      data: user,
      message: "Berhasil mengambil data user",
      currentUserRole: currentUserRole
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Gagal mengambil data user: ${error.message}`,
      currentUserRole: currentUserRole
    };
  }
}

/**
 * Menghapus user - hanya bisa dilakukan oleh superadmin
 * @param userId - ID user yang akan dihapus
 * @param currentUserId - ID user yang sedang login
 * @param currentUserRole - Role user yang sedang login
 * @returns Promise<UserServiceResponse>
 */
export async function deleteUser(
  userId: number,
  currentUserId: number,
  currentUserRole: string
): Promise<UserServiceResponse> {
  try {
    // Cek apakah user mencoba menghapus diri sendiri
    if (userId === currentUserId) {
      return {
        success: false,
        error: "Tidak dapat menghapus akun sendiri",
        currentUserRole: currentUserRole
      };
    }

    // Cek apakah user yang akan dihapus ada
    const [userToDelete] = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userToDelete) {
      return {
        success: false,
        error: "User tidak ditemukan",
        currentUserRole: currentUserRole
      };
    }

    // Hapus user
    await db
      .delete(users)
      .where(eq(users.id, userId));

    return {
      success: true,
      data: userToDelete,
      message: `Berhasil menghapus user ${userToDelete.nama} (${userToDelete.email})`,
      currentUserRole: currentUserRole
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Gagal menghapus user: ${error.message}`,
      currentUserRole: currentUserRole
    };
  }
}

/**
 * Mengupdate role user - hanya bisa dilakukan oleh superadmin
 * @param userId - ID user yang akan diupdate
 * @param newRole - Role baru
 * @param currentUserId - ID user yang sedang login
 * @param currentUserRole - Role user yang sedang login
 * @returns Promise<UserServiceResponse>
 */
export async function updateUserRole(
  userId: number,
  newRole: 'admin' | 'superadmin',
  currentUserId: number,
  currentUserRole: string
): Promise<UserServiceResponse> {
  try {
    // Cek apakah user mencoba mengupdate diri sendiri
    if (userId === currentUserId) {
      return {
        success: false,
        error: "Tidak dapat mengupdate role sendiri",
        currentUserRole: currentUserRole
      };
    }

    // Cek apakah user yang akan diupdate ada
    const [userToUpdate] = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userToUpdate) {
      return {
        success: false,
        error: "User tidak ditemukan",
        currentUserRole: currentUserRole
      };
    }

    // Update role user
    await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, userId));

    // Ambil data user yang sudah diupdate
    const [updatedUser] = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    return {
      success: true,
      data: updatedUser,
      message: `Berhasil mengupdate role user ${updatedUser.nama} menjadi ${newRole}`,
      currentUserRole: currentUserRole
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Gagal mengupdate role user: ${error.message}`,
      currentUserRole: currentUserRole
    };
  }
}

/**
 * Promote user menjadi superadmin - hanya ada 1 superadmin
 * @param userId - ID user yang akan dipromote
 * @param currentUserId - ID user yang sedang login (superadmin saat ini)
 * @param currentUserRole - Role user yang sedang login
 * @returns Promise<UserServiceResponse>
 */
export async function promoteToSuperadmin(
  userId: number,
  currentUserId: number,
  currentUserRole: string
): Promise<UserServiceResponse> {
  try {
    // Cek apakah user mencoba promote diri sendiri
    if (userId === currentUserId) {
      return {
        success: false,
        error: "Tidak dapat mempromote diri sendiri",
        currentUserRole: currentUserRole
      };
    }

    // Cek apakah user yang akan dipromote ada
    const [userToPromote] = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userToPromote) {
      return {
        success: false,
        error: "User tidak ditemukan",
        currentUserRole: currentUserRole
      };
    }

    // Cek apakah user sudah superadmin
    if (userToPromote.role === 'superadmin') {
      return {
        success: false,
        error: "User sudah memiliki role superadmin",
        currentUserRole: currentUserRole
      };
    }

    // Mulai transaksi: ubah current superadmin menjadi admin
    await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, currentUserId));

    // Promote user baru menjadi superadmin
    await db
      .update(users)
      .set({ role: 'superadmin' })
      .where(eq(users.id, userId));

    // Ambil data user yang sudah dipromote
    const [promotedUser] = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    return {
      success: true,
      data: promotedUser,
      message: `Berhasil mempromote ${promotedUser.nama} menjadi superadmin. Anda sekarang menjadi admin.`,
      currentUserRole: 'admin' // Role yang baru setelah diturunkan
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Gagal mempromote user: ${error.message}`,
      currentUserRole: currentUserRole
    };
  }
}

/**
 * Register user baru - hanya bisa dilakukan oleh superadmin
 * @param userData - Data user baru
 * @param currentUserRole - Role user yang sedang login
 * @returns Promise<UserServiceResponse>
 */
export async function registerUser(
  userData: {
    email: string;
    nama: string;
    password: string;
    role?: string;
  },
  currentUserRole: string
): Promise<UserServiceResponse> {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Siapkan data user baru
    const allowedRoles = ["admin", "superadmin"] as const;
    type Role = (typeof allowedRoles)[number];
    let finalRole: Role = "admin"; // default admin, bukan superadmin
    
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
    const [createdUser] = await db
      .select({
        id: users.id,
        email: users.email,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, userData.email));
    
    if (!createdUser) {
      throw new Error("Gagal membuat pengguna");
    }
    
    // Buat token JWT menggunakan utility
    const token = createToken({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });
    
    return { 
      success: true,
      data: createdUser,
      message: `Berhasil membuat user ${createdUser.nama} dengan role ${createdUser.role}`,
      currentUserRole: currentUserRole
    };
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return {
        success: false,
        error: "Email sudah terdaftar",
        currentUserRole: currentUserRole
      };
    }
    return {
      success: false,
      error: `Gagal membuat user: ${error.message}`,
      currentUserRole: currentUserRole
    };
  }
}