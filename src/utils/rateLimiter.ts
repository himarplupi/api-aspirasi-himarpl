import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';
import { applyCors } from './cors';

// Rate limiter untuk API POST aspirasi - 1 request per menit
const postAspirasiLimiter = new RateLimiterMemory({
  points: 30, // Jumlah request yang diizinkan
  duration: 60, // Dalam detik (1 menit)
});

// Middleware untuk menerapkan rate limit
export async function applyPostAspirasiRateLimit(request: NextRequest) {
  try {
    // Dapatkan IP address dari request
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    // console.log(`[POST /api/aspirasi] Request from IP: ${ip}`);
    // Coba konsumsi point untuk IP ini
    await postAspirasiLimiter.consume(ip);
    
    // Jika berhasil, tidak ada rate limit yang terpicu
    return null;
  } catch (error: unknown) {
    // Rate limit terpicu
    const rateLimitError = error as { msBeforeNext?: number };
    const resetAfterSeconds = Math.round((rateLimitError.msBeforeNext || 60000) / 1000);
    
    return applyCors(
      NextResponse.json(
        {
          success: 'error',
          error: `Terlalu banyak permintaan. Coba lagi setelah ${resetAfterSeconds} detik.`,
        },
        {
          status: 429, // Too Many Requests
          headers: {
            'Retry-After': String(resetAfterSeconds),
          },
        }
      )
    );
  }
}