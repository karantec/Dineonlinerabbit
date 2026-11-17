'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import Icon from '@/components/Icon';
import { BUSINESS_TYPES } from '@/lib/subscription';

export default function Register() {
  const [f, setF] = useState({ name: '', slug: '', ownerName: '', email: '', phone: '', address: '', businessType: 'restaurant' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      const d = await r.json();
      r.ok ? setDone(true) : setErr(d.error);
    } catch { setErr('Cannot reach the server'); }
    setBusy(false);
  }

  if (done) return (
    <AuthShell title="Request received" subtitle="Thanks for registering.">
      <div className="card" style={{ background: 'var(--brand-50)' }}>
        <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}><Icon name="mail" size={22} /><p style={{ margin: 0 }}>Our team will review <b>{f.name}</b>. Once approved, your login credentials are sent to <b>{f.email}</b>.</p></div>
      </div>
      <Link className="btn" style={{ marginTop: '1rem' }} href="/">Back to home</Link>
    </AuthShell>
  );

  return (
    <AuthShell title="Register your business" subtitle="We'll review your request and email your login.">
      <form onSubmit={submit}>
        <label>I run a</label>
        <div className="seg">{BUSINESS_TYPES.map((t) => <button type="button" key={t.value} className={f.businessType === t.value ? 'on' : ''} onClick={() => setF({ ...f, businessType: t.value })}>{t.emoji} {t.label}</button>)}</div>
        <label>Business name *</label><input required value={f.name} onChange={set('name')} />
        <label>Menu URL slug (optional)</label><input placeholder="my-restaurant" value={f.slug} onChange={set('slug')} />
        <div className="row" style={{ gap: '.7rem', flexWrap: 'nowrap' }}>
          <div style={{ flex: 1 }}><label>Owner name</label><input value={f.ownerName} onChange={set('ownerName')} /></div>
          <div style={{ flex: 1 }}><label>Phone</label><input value={f.phone} onChange={set('phone')} /></div>
        </div>
        <label>Email *</label><input type="email" required value={f.email} onChange={set('email')} />
        <label>Address</label><input value={f.address} onChange={set('address')} />
        {err && <div className="err">{err}</div>}
        <button className="btn block lg" style={{ marginTop: '1.1rem' }} disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button>
      </form>
      <p className="muted" style={{ marginTop: '1.2rem' }}>Already approved? <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 700 }}>Login</Link></p>
    </AuthShell>
  );
}
