'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';

export default function Settings() {
  const [r, setR] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { fetch('/api/settings').then((x) => x.json()).then((d) => setR(d.restaurant)); }, []);
  if (!r) return <div className="skel" style={{ height: 320 }} />;
  const set = (k, v) => { setSaved(false); setR({ ...r, [k]: v }); };

  async function save(e) {
    e.preventDefault();
    const res = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: r.name, phone: r.phone, address: r.address, taxRate: +r.taxRate, currency: r.currency, tables: +r.tables, hours: r.hours }) });
    setSaved(res.ok);
  }

  return (
    <>
      <div className="page-head"><div><h1>Store Settings</h1><p>Tax, currency, tables and opening hours.</p></div></div>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <form className="card" onSubmit={save}>
          <label style={{ marginTop: 0 }}>Restaurant name</label><input value={r.name} onChange={(e) => set('name', e.target.value)} />
          <label>Phone</label><input value={r.phone || ''} onChange={(e) => set('phone', e.target.value)} />
          <label>Address</label><input value={r.address || ''} onChange={(e) => set('address', e.target.value)} />
          <div className="row" style={{ gap: '.7rem', flexWrap: 'nowrap' }}>
            <div style={{ flex: 1 }}><label>Tax rate (%)</label><input type="number" step="0.1" min="0" value={r.taxRate} onChange={(e) => set('taxRate', e.target.value)} /></div>
            <div style={{ flex: 1 }}><label>Currency</label><input value={r.currency} onChange={(e) => set('currency', e.target.value)} /></div>
            <div style={{ flex: 1 }}><label>Tables</label><input type="number" min="1" value={r.tables} onChange={(e) => set('tables', e.target.value)} /></div>
          </div>
          <div className="row" style={{ gap: '.7rem', flexWrap: 'nowrap' }}>
            <div style={{ flex: 1 }}><label>Opens</label><input type="time" value={r.hours?.open || ''} onChange={(e) => set('hours', { ...r.hours, open: e.target.value })} /></div>
            <div style={{ flex: 1 }}><label>Closes</label><input type="time" value={r.hours?.close || ''} onChange={(e) => set('hours', { ...r.hours, close: e.target.value })} /></div>
          </div>
          <div className="row" style={{ marginTop: '1.2rem' }}><button className="btn">Save settings</button>{saved && <span className="ok"><Icon name="check" size={14} /> Saved</span>}</div>
        </form>

        <div className="card" style={{ background: 'var(--brand-50)' }}>
          <div className="stat-ico" style={{ marginBottom: '.8rem' }}><Icon name="qr" size={22} /></div>
          <h3>Your menu link & QR codes</h3>
          <p className="muted">Guests open <code>/{r.slug}/menu?table=N</code>. Generate printable QR codes for all {r.tables} tables in QR Codes.</p>
          <div className="row"><Link href="/dashboard/qr" className="btn"><Icon name="qr" size={16} /> Open QR Studio</Link><Link href={`/${r.slug}`} target="_blank" className="btn ghost"><Icon name="store" size={15} /> Landing page</Link><Link href={`/${r.slug}/menu?table=1`} target="_blank" className="btn ghost"><Icon name="external" size={15} /> Preview menu</Link></div>
        </div>
      </div>
    </>
  );
}
