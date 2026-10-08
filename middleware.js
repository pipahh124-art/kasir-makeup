import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtKey } from './lib/jwt-key.mjs';
export async function middleware(req) {
  const key = getJwtKey();
  let s = null;
  try {
    s = (await jwtVerify(req.cookies.get('token')?.value, key)).payload;
  } catch {}
  if (!s) return NextResponse.redirect(new URL('/login', req.url));
  if (req.nextUrl.pathname.startsWith('/admin') && s.role !== 'admin')
    return NextResponse.redirect(new URL('/kasir', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*', '/kasir/:path*'] };