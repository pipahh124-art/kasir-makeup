import bcrypt from 'bcryptjs';
import { db } from '../../../../lib/db';
import { sign } from '../../../../lib/auth';
export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const [[u]] = await db.query('SELECT * FROM users WHERE username=?', [username]);
    if (!u || !(await bcrypt.compare(password, u.password)))
      return Response.json({ error: 'Username atau password salah' }, { status: 401 });
    const token = await sign({ id: u.id, nama: u.nama, role: u.role });
    const res = Response.json({ role: u.role });
    res.headers.append('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`);
    return res;
  } catch (e) {
    return Response.json({ error: 'Gagal terhubung ke database: ' + e.message }, { status: 500 });
  }
}