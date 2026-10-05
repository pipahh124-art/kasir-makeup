import bcrypt from 'bcryptjs';
import { db } from '../../../lib/db';
import { need } from '../../../lib/auth';
export async function GET() {
  const [, err] = await need('admin'); if (err) return err;
  const [rows] = await db.query('SELECT id,nama,username,role FROM users ORDER BY id');
  return Response.json(rows);
}
export async function POST(req) {
  const [, err] = await need('admin'); if (err) return err;
  const { nama, username, password } = await req.json();
  try {
    await db.query('INSERT INTO users (nama,username,password,role) VALUES (?,?,?,"cashier")',
      [nama, username, await bcrypt.hash(password, 10)]);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: 'Username sudah dipakai' }, { status: 400 }); }
}