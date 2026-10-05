import Link from 'next/link';
export default function Pilih() {
  return (
    <div className="auth">
      <div className="auth-card wide">
        <div className="logo-img"><img src="/logo.jpeg" alt="Pivelle Skin's" /></div>
        <p className="sub">Pilih jenis login</p>
        <div className="choose">
          <Link href="/login/admin" className="opt"><span>★</span><b>Login Admin</b><small>Kelola produk, kasir, dan laporan</small></Link>
          <Link href="/login/kasir" className="opt"><span>✦</span><b>Login Kasir</b><small>Transaksi dan cetak struk</small></Link>
        </div>
      </div>
    </div>
  );
}