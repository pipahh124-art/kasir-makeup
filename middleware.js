import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
export async function middleware(req) {
  let s = null;
  try {
    s = (await jwtVerify(req.cookies.get('token')?.value, new TextEncoder().encode(process.env.JWT_SECRET))).payload;
  } catch {}
  if (!s) return NextResponse.redirect(new URL('/login', req.url));
  if (req.nextUrl.pathname.startsWith('/admin') && s.role !== 'admin')
    return NextResponse.redirect(new URL('/kasir', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*', '/kasir/:path*'] };