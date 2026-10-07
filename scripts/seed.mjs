import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import nextEnv from '@next/env';
import { getDbConfig } from '../lib/db-config.mjs';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const c = await mysql.createConnection({ ...getDbConfig(), multipleStatements: true });
await c.query(fs.readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
const u = [['Administrator', 'admin', 'admin123', 'admin'], ['Kasir Satu', 'kasir1', 'kasir123', 'cashier']];
for (const [n, un, pw, r] of u)
  await c.query('INSERT IGNORE INTO users (nama,username,password,role) VALUES (?,?,?,?)', [n, un, await bcrypt.hash(pw, 10), r]);
const p = [
  ['PS001', 'Lipstik Matte Rose', 'Lipstik', 65000, 30], ['PS002', 'Foundation Natural Beige', 'Foundation', 120000, 20],
  ['PS003', 'Bedak Padat Translucent', 'Bedak', 55000, 25], ['PS004', 'Maskara Waterproof', 'Mata', 70000, 15],
  ['PS005', 'Eyeshadow Palette Nude', 'Mata', 150000, 10], ['PS006', 'Blush On Peach', 'Pipi', 60000, 18],
  ['PS007', 'Lip Tint Cherry', 'Lipstik', 45000, 40], ['PS008', 'Pensil Alis Brown', 'Alis', 30000, 50]];
for (const x of p) await c.query('INSERT IGNORE INTO products (kode_barang,nama_barang,kategori,harga,stok) VALUES (?,?,?,?,?)', x);
console.log('Seed selesai. admin/admin123 , kasir1/kasir123');
await c.end();