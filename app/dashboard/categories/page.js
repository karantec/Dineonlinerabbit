'use client';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';

const json = { 'Content-Type': 'application/json' };

export default function Categories() {
  const [cats, setCats] = useState(null);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const load = () => fetch('/api/categories').then((r) => r.json()).then((d) => setCats(d.categories || []));
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault(); setErr('');
    await fetch('/api/categories', { method: 'POST', headers: json, body: JSON.stringify({ name, sort: cats.length }) });
    setName(''); load();
  }
  const patch = (c, sort, nm) => fetch(`/api/categories/${c._id}`, { method: 'PATCH', headers: json, body: JSON.stringify({ name: nm ?? c.name, sort: sort ?? c.sort }) });
  async function move(i, dir) {
    const a = cats[i], b = cats[i + dir]; if (!b) return;
    await Promise.all([patch(a, i + dir), patch(b, i)]); load();
  }
  async function del(c) {
    setErr('');
    const r = await fetch(`/api/categories/${c._id}`, { method: 'DELETE' });
    if (!r.ok) setErr((await r.json()).error);
    load();
  }

  if (!cats) return <div className="skel" style={{ height: 240 }} />;
  return (
    <>
      <div className="page-head"><div><h1>Categories</h1><p>The order here is the order guests see on the menu.</p></div></div>
      <form className="row" onSubmit={add} style={{ marginBottom: '1rem' }}><input required placeholder="New category, e.g. Starters" value={name} onChange={(e) => setName(e.target.value)} style={{ maxWidth: 340 }} /><button className="btn"><Icon name="plus" size={16} /> Add category</button></form>
      {err && <div className="err" style={{ marginBottom: '.6rem' }}>{err}</div>}
      <div className="card">{cats.map((c, i) => (
        <div key={c._id} className="row spread" style={{ padding: '.55rem 0', borderBottom: i < cats.length - 1 ? '1px solid var(--line)' : 0, flexWrap: 'nowrap' }}>
          <div className="row" style={{ flex: 1, flexWrap: 'nowrap' }}><span className="badge">{i + 1}</span><input defaultValue={c.name} style={{ maxWidth: 320 }} onBlur={async (e) => { if (e.target.value && e.target.value !== c.name) { await patch(c, undefined, e.target.value); load(); } }} /></div>
          <div className="row" style={{ gap: '.3rem', flexWrap: 'nowrap' }}>
            <button className="btn ghost sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
            <button className="btn ghost sm" onClick={() => move(i, 1)} disabled={i === cats.length - 1} aria-label="Move down">↓</button>
            <button className="btn ghost sm" style={{ color: 'var(--danger)' }} onClick={() => del(c)} aria-label="Delete"><Icon name="trash" size={14} /></button>
          </div>
        </div>))}
        {!cats.length && <div className="empty">No categories yet. Add your first one above.</div>}
      </div>
    </>
  );
}
