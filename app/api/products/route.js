import { db } from '../../../lib/db';
import { need } from '../../../lib/auth';
const bad = (m, st = 400) => Response.json({ error: m }, { status: st });

export async function GET(req) {
  const [, err] = await need(); if (err) return err;
  const sp = new URL(req.url).searchParams;
  const kode = sp.get('kode'), q = `%${sp.get('q') || ''}%`;
  if (kode) {
    const [[p]] = await db.query('SELECT * FROM products WHERE kode_barang=?', [kode]);
    return p ? Response.json(p) : bad('Barang tidak ditemukan', 404);
  }
  const [rows] = await db.query('SELECT * FROM products WHERE nama_barang LIKE ? OR kode_barang LIKE ? ORDER BY nama_barang', [q, q]);
  return Response.json(rows);
}
export async function POST(req) {
  const [, err] = await need('admin'); if (err) return err;
  const b = await req.json();
  try {
    await db.query('INSERT INTO products (kode_barang,nama_barang,kategori,harga,stok,foto) VALUES (?,?,?,?,?,?)',
      [b.kode_barang, b.nama_barang, b.kategori, b.harga, b.stok, b.foto || null]);
    return Response.json({ ok: true });
  } catch { return bad('Kode barang sudah dipakai'); }
}
export async function PUT(req) {
  const [, err] = await need('admin'); if (err) return err;
  const b = await req.json();
  try {
    await db.query('UPDATE products SET kode_barang=?,nama_barang=?,kategori=?,harga=?,stok=?,foto=? WHERE id=?',
      [b.kode_barang, b.nama_barang, b.kategori, b.harga, b.stok, b.foto || null, b.id]);
    return Response.json({ ok: true });
  } catch { return bad('Gagal update (kode mungkin sudah dipakai)'); }
}
export async function DELETE(req) {
  const [, err] = await need('admin'); if (err) return err;
  try {
    await db.query('DELETE FROM products WHERE id=?', [new URL(req.url).searchParams.get('id')]);
    return Response.json({ ok: true });
  } catch { return bad('Barang sudah pernah terjual, tidak bisa dihapus'); }
}