import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const code = params.code;
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);

  // Store referral code in cookie (7 days, readable by client)
  response.cookies.set('ref_code', code, {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
  });

  return response;
}
