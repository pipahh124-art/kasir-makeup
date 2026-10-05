'use client';
import { useEffect, useState } from 'react';
import { api, rp, resizeImage } from '../../lib/api';

function Thumb({ src, cls = '' }) {
  return src ? <img className={'thumb ' + cls} src={src} alt="" /> : <div className={'thumb ph ' + cls}>✦</div>;
}

export default function Admin() {
  const [tab, setTab] = useState('produk');
  const [nama, setNama] = useState('');
  useEffect(() => { api('/api/auth/me').then((u) => setNama(u.nama)).catch(() => {}); }, []);
  const logout = async () => { await api('/api/auth/logout', {}); location.href = '/login'; };
  const tabs = [['produk', 'Produk'], ['kasir', 'Akun Kasir'], ['laporan', 'Laporan']];
  return (
    <>
      <div className="topbar">
        <div className="brand">✦ Pivelle Skin's <small>Admin</small></div>
        <div className="tabs">
          {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        <div className="who"><span>{nama}</span><button className="ghost" onClick={logout}>Keluar</button></div>
      </div>
      <main className="page">
        {tab === 'produk' && <Produk />}
        {tab === 'kasir' && <AkunKasir />}
        {tab === 'laporan' && <Laporan />}
      </main>
    </>
  );
}

const kosong = { kode_barang: '', nama_barang: '', kategori: '', harga: '', stok: '', foto: '' };
function Produk() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(kosong);
  const [q, setQ] = useState('');
  const load = () => api('/api/products?q=' + encodeURIComponent(q)).then(setList).catch((e) => alert(e.message));
  useEffect(() => { load(); }, [q]);
  const simpan = async (e) => {
    e.preventDefault();
    try { await api('/api/products', f, f.id ? 'PUT' : 'POST'); setF(kosong); load(); }
    catch (er) { alert(er.message); }
  };
  const hapus = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    try { await api('/api/products?id=' + id, null, 'DELETE'); load(); } catch (er) { alert(er.message); }
  };
  const pilih = async (e) => {
    const file = e.target.files[0];
    if (file) setF({ ...f, foto: await resizeImage(file) });
  };
  const inp = (k, ph, t = 'text') => (
    <input type={t} placeholder={ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} required />
  );
  return (
    <>
      <form className="card" onSubmit={simpan}>
        <h3>{f.id ? 'Edit Produk' : 'Tambah Produk'}</h3>
        <div className="fgrid">
          {inp('kode_barang', 'Kode / barcode')}{inp('nama_barang', 'Nama produk')}{inp('kategori', 'Kategori')}
          {inp('harga', 'Harga (Rp)', 'number')}{inp('stok', 'Stok', 'number')}
          <label className="file">
            <Thumb src={f.foto} cls="sm" /><span>{f.foto ? 'Ganti foto' : 'Pilih foto produk'}</span>
            <input type="file" accept="image/*" onChange={pilih} hidden />
          </label>
        </div>
        <div className="row">
          <button className="pri">{f.id ? 'Simpan Perubahan' : 'Tambah Produk'}</button>
          {f.id && <button type="button" onClick={() => setF(kosong)}>Batal</button>}
        </div>
      </form>
      <input className="search" placeholder="Cari produk..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card tbl">
        <table>
          <thead><tr><th>Foto</th><th>Kode</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Stok</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td><Thumb src={p.foto} cls="sm" /></td><td>{p.kode_barang}</td><td><b>{p.nama_barang}</b></td>
                <td>{p.kategori}</td><td>{rp(p.harga)}</td>
                <td><span className={'badge ' + (p.stok < 5 ? 'bad' : 'ok')}>{p.stok}</span></td>
                <td className="act">
                  <button onClick={() => { setF(p); window.scrollTo(0, 0); }}>Edit</button>
                  <button className="danger" onClick={() => hapus(p.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AkunKasir() {
  const awal = { nama: '', username: '', password: '' };
  const [list, setList] = useState([]);
  const [f, setF] = useState(awal);
  const load = () => api('/api/users').then(setList);
  useEffect(() => { load(); }, []);
  const simpan = async (e) => {
    e.preventDefault();
    try { await api('/api/users', f); setF(awal); load(); } catch (er) { alert(er.message); }
  };
  return (
    <>
      <form className="card" onSubmit={simpan}>
        <h3>Daftarkan Kasir Baru</h3>
        <div className="fgrid">
          <input placeholder="Nama lengkap" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} required />
          <input placeholder="Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required />
          <input type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        </div>
        <button className="pri">Daftarkan</button>
      </form>
      <div className="card tbl">
        <table>
          <thead><tr><th>Nama</th><th>Username</th><th>Role</th></tr></thead>
          <tbody>{list.map((u) => <tr key={u.id}><td>{u.nama}</td><td>{u.username}</td><td><span className="badge">{u.role}</span></td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

function Laporan() {
  const hari = new Date().toISOString().slice(0, 10);
  const [dari, setDari] = useState(hari);
  const [sampai, setSampai] = useState(hari);
  const [view, setView] = useState('riwayat');
  const [trx, setTrx] = useState([]);
  const [rows, setRows] = useState([]);
  const load = async () => {
    try {
      const qs = `?dari=${dari}&sampai=${sampai}`;
      setTrx(await api('/api/transactions' + qs));
      setRows(await api('/api/reports' + qs));
    } catch (e) { alert(e.message); }
  };
  useEffect(() => { load(); }, []);
  const total = trx.reduce((a, t) => a + Number(t.total), 0);
  const terjual = rows.reduce((a, r) => a + Number(r.terjual), 0);

  const pdf = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Pivelle Skin's - " + (view === 'riwayat' ? 'Riwayat Belanja' : 'Barang Terjual'), 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${dari} s/d ${sampai}`, 14, 22);
    if (view === 'riwayat')
      autoTable(doc, {
        startY: 28, styles: { fontSize: 8 },
        head: [['No Struk', 'Tanggal', 'Kasir', 'Member', 'Bayar', 'Belanja', 'Total']],
        body: trx.map((t) => [t.no_struk, t.tanggal, t.kasir, t.member || '-', t.metode_bayar,
          t.items.map((i) => `${i.nama} x${i.jumlah}`).join(', '), rp(t.total)]),
        foot: [['', '', '', '', '', 'Total', rp(total)]],
      });
    else
      autoTable(doc, {
        startY: 28,
        head: [['Kode', 'Nama Barang', 'Terjual', 'Pendapatan']],
        body: rows.map((r) => [r.kode_barang, r.nama_barang, r.terjual, rp(r.pendapatan)]),
        foot: [['', '', 'Total', rp(total)]],
      });
    doc.save(`laporan-${view}-${dari}-${sampai}.pdf`);
  };

  return (
    <>
      <div className="card row">
        <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
        <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
        <button className="pri" onClick={load}>Tampilkan</button>
        <button onClick={pdf} disabled={!trx.length}>Download PDF</button>
      </div>
      <div className="stats">
        <div className="stat"><span>Total Pendapatan</span><b>{rp(total)}</b></div>
        <div className="stat"><span>Jumlah Transaksi</span><b>{trx.length}</b></div>
        <div className="stat"><span>Barang Terjual</span><b>{terjual}</b></div>
      </div>
      <div className="tabs sub">
        <button className={view === 'riwayat' ? 'on' : ''} onClick={() => setView('riwayat')}>Riwayat Belanja</button>
        <button className={view === 'barang' ? 'on' : ''} onClick={() => setView('barang')}>Barang Terjual</button>
      </div>
      <div className="card tbl">
        {view === 'riwayat' ? (
          <table>
            <thead><tr><th>No Struk</th><th>Tanggal</th><th>Kasir</th><th>Member</th><th>Bayar</th><th>Belanja</th><th>Total</th></tr></thead>
            <tbody>
              {trx.map((t) => (
                <tr key={t.id}>
                  <td>{t.no_struk}</td><td>{t.tanggal}</td><td>{t.kasir}</td><td>{t.member || '-'}</td>
                  <td><span className="badge">{t.metode_bayar}</span></td>
                  <td>{t.items.map((i) => `${i.nama} x${i.jumlah}`).join(', ')}</td><td><b>{rp(t.total)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Kode</th><th>Nama Barang</th><th>Terjual</th><th>Pendapatan</th></tr></thead>
            <tbody>
              {rows.map((r) => <tr key={r.kode_barang}><td>{r.kode_barang}</td><td>{r.nama_barang}</td><td>{r.terjual}</td><td>{rp(r.pendapatan)}</td></tr>)}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}