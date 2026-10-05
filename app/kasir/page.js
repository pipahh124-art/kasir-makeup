'use client';
import { useEffect, useRef, useState } from 'react';
import { api, rp } from '../../lib/api';

function Thumb({ src, cls = '' }) {
  return src ? <img className={'thumb ' + cls} src={src} alt="" /> : <div className={'thumb ph ' + cls}>✦</div>;
}

export default function Kasir() {
  const [nama, setNama] = useState('');
  const [prods, setProds] = useState([]);
  const [q, setQ] = useState('');
  const [cart, setCart] = useState([]);
  const [pakaiMember, setPM] = useState(false);
  const [telp, setTelp] = useState('');
  const [member, setMember] = useState(null);
  const [metode, setMetode] = useState('Cash');
  const [bayar, setBayar] = useState('');
  const [qris, setQris] = useState(false);
  const [struk, setStruk] = useState(null);
  const ref = useRef();

  const load = () => api('/api/products').then(setProds).catch((e) => alert(e.message));
  useEffect(() => { api('/api/auth/me').then((u) => setNama(u.nama)); load(); ref.current?.focus(); }, []);

  const total = cart.reduce((a, c) => a + c.harga * c.jumlah, 0);
  const tampil = prods.filter((p) => (p.nama_barang + p.kode_barang + (p.kategori || '')).toLowerCase().includes(q.toLowerCase()));

  const tambah = (p) => {
    if (p.stok < 1) return alert('Stok habis');
    setCart((c) => c.find((x) => x.id === p.id)
      ? c.map((x) => (x.id === p.id ? { ...x, jumlah: Math.min(x.jumlah + 1, p.stok) } : x))
      : [...c, { ...p, jumlah: 1 }]);
  };
  const scan = (e) => {
    e.preventDefault(); // scanner barcode mengetik kode lalu menekan Enter
    const p = prods.find((x) => x.kode_barang.toLowerCase() === q.trim().toLowerCase());
    if (p) { tambah(p); setQ(''); }
  };
  const ubah = (id, d) => setCart((c) => c.map((x) => (x.id === id ? { ...x, jumlah: Math.max(1, Math.min(x.stok, x.jumlah + d)) } : x)));
  const hapus = (id) => setCart((c) => c.filter((x) => x.id !== id));

  const cariMember = async () => {
    try {
      const m = await api('/api/members?telp=' + encodeURIComponent(telp));
      if (m) return setMember(m);
      if (confirm('No telp belum terdaftar. Daftarkan sebagai member baru?')) {
        const n = prompt('Nama member:');
        if (n) setMember(await api('/api/members', { nama: n, no_telp: telp }));
      }
    } catch (er) { alert(er.message); }
  };

  const klikBayar = () => {
    if (!cart.length) return alert('Keranjang masih kosong');
    if (metode === 'Cash' && Number(bayar) < total) return alert('Uang yang diterima kurang');
    if (metode === 'QRIS') return setQris(true);
    proses();
  };
  const proses = async () => {
    const b = metode === 'Cash' ? Number(bayar) : total;
    try {
      const r = await api('/api/transactions', {
        items: cart.map((c) => ({ id: c.id, jumlah: c.jumlah })),
        member_id: member?.id, metode_bayar: metode, bayar: b,
      });
      setStruk({ ...r, member: member?.nama });
      setCart([]); setMember(null); setTelp(''); setBayar(''); setPM(false); load();
    } catch (er) { alert(er.message); }
    setQris(false);
  };
  const logout = async () => { await api('/api/auth/logout', {}); location.href = '/login'; };

  return (
    <>
      <div className="topbar">
        <div className="brand">✦ Pivelle Skin's <small>Kasir</small></div>
        <div className="who"><span>{nama}</span><button className="ghost" onClick={logout}>Keluar</button></div>
      </div>
      <main className="page pos">
        <section>
          <form onSubmit={scan}>
            <input ref={ref} className="search" placeholder="Cari produk atau scan barcode lalu Enter..." value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="products">
            {tampil.map((p) => (
              <button key={p.id} className="pcard" disabled={p.stok < 1} onClick={() => tambah(p)}>
                <Thumb src={p.foto} cls="big" />
                <span className="pname">{p.nama_barang}</span>
                <span className="pcat">{p.kategori}</span>
                <span className="pprice">{rp(p.harga)}</span>
                <span className={'badge ' + (p.stok < 5 ? 'bad' : 'ok')}>Stok {p.stok}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="card cartp">
          <h3>Keranjang</h3>
          <div className="clist">
            {!cart.length && <p className="muted">Belum ada produk. Klik produk untuk menambahkan.</p>}
            {cart.map((c) => (
              <div className="citem" key={c.id}>
                <Thumb src={c.foto} cls="sm" />
                <div className="cinfo"><b>{c.nama_barang}</b><span>{rp(c.harga)}</span></div>
                <div className="qty">
                  <button onClick={() => ubah(c.id, -1)}>−</button><span>{c.jumlah}</span><button onClick={() => ubah(c.id, 1)}>+</button>
                </div>
                <button className="x" onClick={() => hapus(c.id)}>✕</button>
              </div>
            ))}
          </div>

          <label className="chk"><input type="checkbox" checked={pakaiMember} onChange={(e) => { setPM(e.target.checked); setMember(null); }} /> Pelanggan member</label>
          {pakaiMember && (
            <div className="row">
              <input placeholder="No telp member" value={telp} onChange={(e) => setTelp(e.target.value)} />
              <button onClick={cariMember}>Cari</button>
              {member && <b className="okc">✓ {member.nama}</b>}
            </div>
          )}

          <div className="seg">
            {['Cash', 'QRIS', 'Debit'].map((m) => <button key={m} className={metode === m ? 'on' : ''} onClick={() => setMetode(m)}>{m}</button>)}
          </div>
          {metode === 'Cash' && <input type="number" placeholder="Uang diterima" value={bayar} onChange={(e) => setBayar(e.target.value)} />}
          {metode === 'Cash' && total > 0 && Number(bayar) >= total && <p className="okc">Kembalian: <b>{rp(bayar - total)}</b></p>}

          <div className="total"><span>Total</span><b>{rp(total)}</b></div>
          <button className="pri big" onClick={klikBayar}>Bayar</button>
        </aside>
      </main>

      {qris && (
        <div className="modal">
          <div className="mbox center-t">
            <h3>Scan QRIS</h3>
            <p className="muted">Bayar dengan Dana / GoPay / e-wallet lain</p>
            <img className="qr" src="/qris.png" alt="QRIS" />
            <div className="total"><span>Total</span><b>{rp(total)}</b></div>
            <p className="muted">Cek dulu notifikasi pembayaran masuk di aplikasi, baru konfirmasi.</p>
            <div className="row">
              <button className="pri" onClick={proses}>Pembayaran Sudah Masuk</button>
              <button onClick={() => setQris(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {struk && (
        <div className="modal">
          <div className="struk">
            <h3 className="c">PIVELLE SKIN'S</h3>
            <p className="c">Struk Pembelian</p>
            <hr />
            <p>{struk.no_struk}<br />{struk.tanggal}<br />Kasir: {struk.kasir}{struk.member && <><br />Member: {struk.member}</>}</p>
            <hr />
            {struk.items.map((i, k) => (
              <p key={k}>{i.nama}<br />{i.jumlah} x {rp(i.harga)} <span className="r">{rp(i.subtotal)}</span></p>
            ))}
            <hr />
            <p><b>Total <span className="r">{rp(struk.total)}</span></b></p>
            <p>Bayar ({struk.metode_bayar}) <span className="r">{rp(struk.bayar)}</span></p>
            <p>Kembali <span className="r">{rp(struk.bayar - struk.total)}</span></p>
            <hr />
            <p className="c">Terima kasih sudah berbelanja ✦</p>
            <div className="noprint row">
              <button className="pri" onClick={() => window.print()}>Cetak Struk</button>
              <button onClick={() => { setStruk(null); ref.current?.focus(); }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}