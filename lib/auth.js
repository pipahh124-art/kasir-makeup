import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getJwtKey } from './jwt-key.mjs';
export const sign = (p) => new SignJWT(p).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('8h').sign(getJwtKey());
export async function session() {
  try { const t = (await cookies()).get('token')?.value; return (await jwtVerify(t, getJwtKey())).payload; }
  catch { return null; }
}
// pakai: const [s, err] = await need('admin'); if (err) return err;
export async function need(...roles) {
  const s = await session();
  if (!s || (roles.length && !roles.includes(s.role)))
    return [null, Response.json({ error: 'Tidak diizinkan' }, { status: 403 })];
  return [s, null];
}