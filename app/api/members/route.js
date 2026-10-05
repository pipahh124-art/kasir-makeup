import { db } from '../../../lib/db';
import { need } from '../../../lib/auth';
export async function GET(req) {
  const [, err] = await need(); if (err) return err;
  const telp = new URL(req.url).searchParams.get('telp');
  const [[m]] = await db.query('SELECT * FROM members WHERE no_telp=?', [telp]);
  return Response.json(m || null);
}
export async function POST(req) {
  const [, err] = await need(); if (err) return err;
  const { nama, no_telp } = await req.json();
  try {
    const [r] = await db.query('INSERT INTO members (nama,no_telp) VALUES (?,?)', [nama, no_telp]);
    return Response.json({ id: r.insertId, nama, no_telp });
  } catch { return Response.json({ error: 'No telp sudah terdaftar' }, { status: 400 }); }
}