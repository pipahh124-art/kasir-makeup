'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function LoginForm({ role, judul }) {
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const r = await api('/api/auth/login', { ...f, role });
      location.href = r.role === 'admin' ? '/admin' : '/kasir';
    } catch (er) { setErr(er.message); }
  };
  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <div className="logo-img"><img src="/logo.jpeg" alt="Pivelle Skin's" /></div>
        <p className="sub">{judul}</p>
        <input placeholder="Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required />
        <input type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        {err && <p className="err">{err}</p>}
        <button className="pri big">Masuk</button>
        <Link href="/login" className="back">← Kembali pilih role</Link>
      </form>
    </div>
  );
}