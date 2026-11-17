'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';

const DEMO = [
  ['Super admin', 'admin@omnibite.com', 'Admin@123'],
  ['Owner', 'owner@spicegarden.com', 'Owner@123'],
  ['Staff', 'staff@spice-garden.com', 'Staff@123'],
];

export default function Login() {
  const router = useRouter();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || 'Login failed'); setBusy(false); return; }
      router.push(d.role === 'superadmin' ? '/admin' : '/dashboard/analytics');
      router.refresh();
    } catch { setErr('Cannot reach the server'); setBusy(false); }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your OmniBite account.">
      <form onSubmit={submit}>
        <label>Email</label><input type="email" required autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <label>Password</label><input type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <div className="err">{err}</div>}
        <button className="btn block lg" style={{ marginTop: '1.1rem' }} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div style={{ marginTop: '1.4rem' }}>
        <div className="muted">Demo accounts (click to fill):</div>
        <div className="demo-chips">{DEMO.map(([n, email, password]) => <button type="button" key={n} onClick={() => setF({ email, password })}>{n}</button>)}</div>
      </div>
      <p className="muted" style={{ marginTop: '1.4rem' }}>New restaurant? <Link href="/register" style={{ color: 'var(--brand)', fontWeight: 700 }}>Register here</Link> · <Link href="/" style={{ fontWeight: 600 }}>Home</Link></p>
    </AuthShell>
  );
}
