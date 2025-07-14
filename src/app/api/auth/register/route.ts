import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/db/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nama, password, role } = body;

    // Validasi input
    if (!email || !nama || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Email, nama, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Proses registrasi user
    const result = await registerUser({ email, nama, password, role });

    // Return response dengan JWT
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const message = error.message || 'Terjadi kesalahan pada server';

    const statusCode = message === 'Email sudah terdaftar' ? 409 : 500;

    return NextResponse.json(
      { status: 'error', message },
      { status: statusCode }
    );
  }
}
