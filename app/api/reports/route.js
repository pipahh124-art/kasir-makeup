import { db } from '../../../lib/db';
import { need } from '../../../lib/auth';
export async function GET(req) {
  const [, err] = await need(); if (err) return err;
  const sp = new URL(req.url).searchParams;
  const [rows] = await db.query(
    `SELECT p.kode_barang, p.nama_barang, SUM(ti.jumlah) AS terjual, SUM(ti.subtotal) AS pendapatan
     FROM transaction_items ti
     JOIN products p ON p.id = ti.product_id
     JOIN transactions t ON t.id = ti.transaction_id
     WHERE DATE(t.tanggal) BETWEEN ? AND ?
     GROUP BY p.id ORDER BY terjual DESC`, [sp.get('dari'), sp.get('sampai')]);
  return Response.json(rows);
}