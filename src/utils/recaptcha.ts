/**
 * Utility untuk verifikasi Google reCAPTCHA v2
 */

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

/**
 * Verifikasi reCAPTCHA v2 token dengan Google API
 * @param token - reCAPTCHA token dari frontend (response dari checkbox)
 * @returns Object dengan isValid dan error message
 */
export async function verifyRecaptcha(
  token: string
): Promise<{ isValid: boolean; error?: string }> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY tidak ditemukan di environment variables");
      return {
        isValid: false,
        error: "reCAPTCHA configuration error",
      };
    }

    // Validasi token format
    if (!token || token.trim().length === 0) {
      console.error("reCAPTCHA token is empty");
      return {
        isValid: false,
        error: "Empty reCAPTCHA token",
      };
    }

    // Log untuk debugging (hanya prefix dan length)
    console.log("Verifying reCAPTCHA token:", {
      prefix: token.substring(0, 20) + "...",
      length: token.length,
      secretKeyPrefix: secretKey.substring(0, 10) + "...",
    });

    // Kirim request ke Google reCAPTCHA API
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data: RecaptchaResponse = await response.json();

    // Log response dari Google
    console.log("reCAPTCHA API response:", data);

    // Cek apakah verifikasi berhasil
    if (!data.success) {
      console.error("reCAPTCHA v2 verification failed:", data["error-codes"]);
      return {
        isValid: false,
        error: `reCAPTCHA verification failed: ${data["error-codes"]?.join(", ")}`,
      };
    }

    // reCAPTCHA v2 hanya mengembalikan success: true/false (tidak ada score)
    console.log("reCAPTCHA verification successful");
    return {
      isValid: true,
    };
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return {
      isValid: false,
      error: "reCAPTCHA verification error",
    };
  }
}
