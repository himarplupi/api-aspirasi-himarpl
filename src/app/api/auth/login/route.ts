import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/db/auth';
import { applyCors, handleOptions } from '@/utils/cors';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  try {
    console.log("berhasil request");

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return applyCors(NextResponse.json(
        { status: 'error', message: 'Email dan password diperlukan' },
        { status: 400 }
      ));
    }

    const result = await loginUser({ email, password });
    console.log("berhasil login", result);

    return applyCors(NextResponse.json(result));

  } catch (error: any) {
    console.error('Login error:', error);
    return applyCors(NextResponse.json(
      { status: 'error', message: error.message || 'Terjadi kesalahan saat login' },
      { status: 401 }
    ));
  }
}
