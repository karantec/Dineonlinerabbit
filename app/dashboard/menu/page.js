'use client';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';

const blank = { name: '', description: '', price: '', category: '', image: '', emoji: '', veg: true, tags: '', sizes: [], addons: [], available: true };
const json = { 'Content-Type': 'application/json' };

export default function MenuPage() {
  const [items, setItems] = useState(null);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');
  const [up, setUp] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  const load = async () => {
    const [m, c] = await Promise.all([fetch('/api/menu').then((r) => r.json()), fetch('/api/categories').then((r) => r.json())]);
    setItems(m.items || []); setCats(c.categories || []);
  };
  useEffect(() => { load(); }, []);

  async function toggle(i) {
    setItems((p) => p.map((x) => (x._id === i._id ? { ...x, available: !x.available } : x)));
    await fetch(`/api/menu/${i._id}`, { method: 'PATCH', headers: json, body: JSON.stringify({ available: !i.available }) });
  }
  async function save(e) {
    e.preventDefault(); setErr('');
    const body = {
      ...form, price: +form.price, category: form.category || null,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : form.tags,
      sizes: form.sizes.filter((s) => s.name).map((s) => ({ name: s.name, price: +s.price })),
      addons: form.addons.filter((s) => s.name).map((s) => ({ name: s.name, price: +s.price })),
    };
    const r = await fetch(form._id ? `/api/menu/${form._id}` : '/api/menu', { method: form._id ? 'PATCH' : 'POST', headers: json, body: JSON.stringify(body) });
    if (!r.ok) { setErr((await r.json()).error || 'Could not save. Only owners can edit dishes.'); return; }
    setForm(null); load();
  }
  async function remove(i) {
    if (!confirm(`Delete ${i.name}?`)) return;
    const r = await fetch(`/api/menu/${i._id}`, { method: 'DELETE' });
    if (!r.ok) alert('Only owners can delete dishes.');
    load();
  }
  async function upload(file) {
    if (!file) return; setUp(true); setErr('');
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json();
    setUp(false); r.ok ? setForm((f) => ({ ...f, image: d.url })) : setErr(d.error);
  }
  const list = (k) => ({
    add: () => setForm({ ...form, [k]: [...form[k], { name: '', price: '' }] }),
    set: (i, f, v) => setForm({ ...form, [k]: form[k].map((x, j) => (j === i ? { ...x, [f]: v } : x)) }),
    del: (i) => setForm({ ...form, [k]: form[k].filter((_, j) => j !== i) }),
  });

  if (!items) return <div className="skel" style={{ height: 320 }} />;
  const shown = items.filter((i) => (cat === 'all' || i.category?._id === cat) && (!q || i.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <div className="page-head">
        <div><h1>Menu</h1><p>{items.length} dishes · toggle a dish off and guests see it instantly.</p></div>
        <button className="btn" onClick={() => { setErr(''); setForm({ ...blank, category: cats[0]?._id || '' }); }}><Icon name="plus" size={17} /> Add dish</button>
      </div>
      <div className="row" style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}><input placeholder="Search dishes…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select style={{ width: 'auto' }} value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
      </div>

      <div className="dish-grid">
        {shown.map((i) => (
          <div key={i._id} className={`mcard ${i.available ? '' : 'off'}`}>
            <div className="thumb-lg">{i.image ? <img src={i.image} alt={i.name} loading="lazy" /> : i.emoji || '🍽️'}</div>
            <div style={{ padding: '.85rem', display: 'flex', flexDirection: 'column', gap: '.35rem', flex: 1 }}>
              <div className="row spread" style={{ flexWrap: 'nowrap' }}><div><span className={`veg-dot ${i.veg ? '' : 'nonveg'}`} /><b>{i.name}</b></div><b>₹{i.price}</b></div>
              <div className="muted">{i.category?.name}{i.tags?.length ? ` · ${i.tags.join(', ')}` : ''}</div>
              <div className="row spread" style={{ marginTop: 'auto', paddingTop: '.4rem' }}>
                <label className="row" style={{ margin: 0, gap: '.5rem', color: 'var(--ink)' }}><span className="switch"><input type="checkbox" checked={i.available} onChange={() => toggle(i)} /><span /></span>{i.available ? 'Available' : 'Sold out'}</label>
                <div className="row" style={{ gap: '.3rem' }}>
                  <button className="btn ghost sm" aria-label="Edit" onClick={() => { setErr(''); setForm({ ...i, category: i.category?._id || '', tags: (i.tags || []).join(', '), price: String(i.price), emoji: i.emoji || '', sizes: i.sizes || [], addons: i.addons || [] }); }}><Icon name="edit" size={14} /></button>
                  <button className="btn ghost sm" aria-label="Delete" onClick={() => remove(i)} style={{ color: 'var(--danger)' }}><Icon name="trash" size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!shown.length && <div className="card empty">No dishes found. Add your first dish with the button above.</div>}

      {form && (
        <div className="modal" onClick={() => setForm(null)}><form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={save}>
          <div className="row spread"><h3 style={{ margin: 0 }}>{form._id ? 'Edit dish' : 'New dish'}</h3><button type="button" className="btn ghost sm" onClick={() => setForm(null)} aria-label="Close"><Icon name="x" size={14} /></button></div>
          <label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Description</label><textarea rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="row" style={{ gap: '.7rem', flexWrap: 'nowrap' }}>
            <div style={{ flex: 1 }}><label>Base price (₹)</label><input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div style={{ flex: 1 }}><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">None</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
            <div style={{ width: 80 }}><label>Emoji</label><input maxLength={4} value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🍛" /></div>
          </div>
          <label>Tags (comma separated)</label><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Bestseller, Spicy" />
          <label>Photo (Cloudinary)</label>
          <div className="row">{form.image && <img src={form.image} width={56} height={56} style={{ borderRadius: 10, objectFit: 'cover' }} alt="" />}<input type="file" accept="image/*" onChange={(e) => upload(e.target.files[0])} style={{ flex: 1 }} />{up && <span className="spinner" />}</div>
          <label className="row" style={{ color: 'var(--ink)', margin: '.8rem 0 0' }}><input type="checkbox" checked={form.veg} onChange={(e) => setForm({ ...form, veg: e.target.checked })} /> Vegetarian</label>
          {['sizes', 'addons'].map((k) => (
            <div key={k}><label>{k === 'sizes' ? 'Sizes / portions (replace the base price when picked)' : 'Add-ons (extra price)'}</label>
              {form[k].map((x, i) => <div key={i} className="row" style={{ marginBottom: 6, flexWrap: 'nowrap' }}><input placeholder="Name" value={x.name} onChange={(e) => list(k).set(i, 'name', e.target.value)} /><input placeholder="₹" type="number" min="0" value={x.price} onChange={(e) => list(k).set(i, 'price', e.target.value)} style={{ width: 100 }} /><button type="button" className="btn ghost sm" onClick={() => list(k).del(i)}><Icon name="x" size={14} /></button></div>)}
              <button type="button" className="btn ghost sm" onClick={list(k).add}><Icon name="plus" size={14} /> Add</button></div>
          ))}
          {err && <div className="err">{err}</div>}
          <div className="row" style={{ marginTop: '1.2rem' }}><button className="btn">Save dish</button><button type="button" className="btn ghost" onClick={() => setForm(null)}>Cancel</button></div>
        </form></div>
      )}
    </>
  );
}
