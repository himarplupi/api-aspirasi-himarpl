// utils/cors.ts
import { NextRequest, NextResponse } from 'next/server';

export function applyCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST,PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Tambahan untuk tangani preflight
export function handleOptions(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return applyCors(response);
}
