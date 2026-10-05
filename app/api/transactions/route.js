import { db } from '../../../lib/db';
import { need } from '../../../lib/auth';
export async function POST(req) {
  const [s, err] = await need(); if (err) return err;
  const { items, member_id, metode_bayar, bayar } = await req.json();
  if (!items?.length) return Response.json({ error: 'Keranjang kosong' }, { status: 400 });
  const c = await db.getConnection();
  try {
    await c.beginTransaction();
    let total = 0; const rows = [];
    for (const it of items) {
      const j = Number(it.jumlah);
      const [[p]] = await c.query('SELECT * FROM products WHERE id=? FOR UPDATE', [it.id]);
      if (!p || !(j > 0) || p.stok < j) throw new Error(`Stok ${p?.nama_barang || 'barang'} tidak cukup`);
      total += p.harga * j; rows.push([p, j]);
    }
    const no = 'STR' + Date.now();
    const [r] = await c.query('INSERT INTO transactions (no_struk,user_id,member_id,metode_bayar,total) VALUES (?,?,?,?,?)',
      [no, s.id, member_id || null, metode_bayar, total]);
    for (const [p, j] of rows) {
      await c.query('INSERT INTO transaction_items (transaction_id,product_id,jumlah,harga_satuan,subtotal) VALUES (?,?,?,?,?)',
        [r.insertId, p.id, j, p.harga, p.harga * j]);
      await c.query('UPDATE products SET stok=stok-? WHERE id=?', [j, p.id]);
    }
    await c.commit();
    return Response.json({
      no_struk: no, tanggal: new Date().toLocaleString('id-ID'), kasir: s.nama, total, metode_bayar,
      bayar: bayar || total,
      items: rows.map(([p, j]) => ({ nama: p.nama_barang, jumlah: j, harga: p.harga, subtotal: p.harga * j })),
    });
  } catch (e) {
    await c.rollback();
    return Response.json({ error: e.message }, { status: 400 });
  } finally { c.release(); }
}
export async function GET(req) {
  const [, err] = await need('admin'); if (err) return err;
  const sp = new URL(req.url).searchParams;
  const [trx] = await db.query(
    `SELECT t.id, t.no_struk, t.tanggal, t.metode_bayar, t.total, u.nama AS kasir, m.nama AS member
     FROM transactions t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN members m ON m.id = t.member_id
     WHERE DATE(t.tanggal) BETWEEN ? AND ? ORDER BY t.tanggal DESC`, [sp.get('dari'), sp.get('sampai')]);
  if (!trx.length) return Response.json([]);
  const [items] = await db.query(
    `SELECT ti.transaction_id, p.nama_barang AS nama, ti.jumlah, ti.harga_satuan AS harga, ti.subtotal
     FROM transaction_items ti JOIN products p ON p.id = ti.product_id
     WHERE ti.transaction_id IN (?)`, [trx.map((t) => t.id)]);
  return Response.json(trx.map((t) => ({ ...t, items: items.filter((i) => i.transaction_id === t.id) })));
}