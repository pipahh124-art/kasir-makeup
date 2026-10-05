export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0');
  return res;
}