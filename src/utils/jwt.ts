import jwt from "jsonwebtoken";

// Kunci rahasia untuk JWT (sebaiknya disimpan di environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "wlawlewlo";

// Interface untuk payload JWT
export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Interface untuk hasil validasi token
export interface TokenValidationResult {
  isValid: boolean;
  payload?: JWTPayload;
  newToken?: string;
  error?: string;
}

// Fungsi untuk membuat token JWT
export function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30m" });
}

// Fungsi untuk memvalidasi token dan auto-refresh jika diperlukan
export function validateToken(token: string): TokenValidationResult {
  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Cek apakah token masih valid
    if (!decoded.exp) {
      return {
        isValid: false,
        error: "Token tidak memiliki waktu kedaluwarsa"
      };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;

    // Jika token sudah kedaluwarsa
    if (timeUntilExpiry <= 0) {
      return {
        isValid: false,
        error: "Token sudah kedaluwarsa"
      };
    }

    // Jika waktu tersisa kurang dari 10 menit (600 detik), buat token baru
    let newToken: string | undefined;
    if (timeUntilExpiry < 600) {
      newToken = createToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      });
    }

    return {
      isValid: true,
      payload: decoded,
      newToken
    };

  } catch (error: any) {
    let errorMessage = "Token tidak valid";
    
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token sudah kedaluwarsa";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Format token tidak valid";
    } else if (error.name === "NotBeforeError") {
      errorMessage = "Token belum aktif";
    }

    return {
      isValid: false,
      error: errorMessage
    };
  }
}

// Fungsi untuk mendapatkan payload tanpa validasi (hanya untuk decode)
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Fungsi untuk memeriksa apakah token akan segera kedaluwarsa
export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 10): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - currentTime;
  const thresholdSeconds = thresholdMinutes * 60;

  return timeUntilExpiry < thresholdSeconds;
}