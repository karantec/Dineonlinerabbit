'use client';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { typeInfo } from '@/lib/subscription';

const STEPS = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

function Thumb({ i }) {
  return <div className="thumb">{i.image ? <img src={i.image} alt={i.name} loading="lazy" /> : i.emoji || '🍽️'}</div>;
}

function Menu() {
  const { slug } = useParams();
  const table = useSearchParams().get('table') || '-';
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [veg, setVeg] = useState(false);
  const [pick, setPick] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [name, setName] = useState('');
  const [placed, setPlaced] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => fetch(`/api/public/menu/${slug}`).then(async (r) => (r.ok ? setData(await r.json()) : setErr('We could not find this restaurant.'))).catch(() => setErr('Failed to load the menu.')), [slug]);
  useEffect(() => {
    load();
    const s = io();
    s.on('connect', () => s.emit('join:menu', slug));
    s.on('menu:changed', load); // live stock sync
    return () => s.disconnect();
  }, [slug, load]);

  // live order tracking
  useEffect(() => {
    if (!placed?._id) return;
    const s = io();
    s.on('connect', () => s.emit('join:order', placed._id));
    s.on('order:update', (o) => setPlaced(o));
    return () => s.disconnect();
  }, [placed?._id]);

  const cur = data?.restaurant.currency || '₹';
  const items = useMemo(() => (data?.items || []).filter((i) => (cat === 'all' || i.category === cat) && (!veg || i.veg) && (!q || i.name.toLowerCase().includes(q.toLowerCase()))), [data, cat, q, veg]);
  const sections = useMemo(() => {
    if (!data) return [];
    return data.categories.map((c) => ({ c, list: items.filter((i) => i.category === c._id) })).concat([{ c: { _id: 'x', name: 'Other' }, list: items.filter((i) => !data.categories.some((c) => c._id === i.category)) }]).filter((s) => s.list.length);
  }, [data, items]);
  const subtotal = cart.reduce((s, c) => s + c.unit * c.qty, 0);
  const tax = subtotal * ((data?.restaurant.taxRate || 0) / 100);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  async function place() {
    setBusy(true);
    try {
      const r = await post('/api/public/orders', { slug, table, customerName: name, items: cart.map((c) => ({ itemId: c.item._id, qty: c.qty, size: c.size, addons: c.addons, note: c.note })) });
      const d = await r.json();
      if (!r.ok) { alert(d.error); load(); setBusy(false); return; }
      setPlaced(d.order); setCart([]); setShowCart(false);
    } catch { alert('Network error. Please try again.'); }
    setBusy(false);
  }

  if (err) return <div className="center"><div className="card" style={{ textAlign: 'center' }}><h2>{err}</h2><p className="muted">Check the QR code or link and try again.</p></div></div>;
  if (!data) return <div className="g-wrap"><div className="skel" style={{ height: 150, borderRadius: '0 0 28px 28px' }} /><div style={{ padding: '1rem' }}>{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 120, marginBottom: 12 }} />)}</div></div>;

  if (placed) {
    const idx = placed.status === 'Cancelled' ? -1 : STEPS.indexOf(placed.status);
    return (
      <div className="g-wrap"><div className="g-hero"><span className="table-pill"><Icon name="check" size={14} /> Order placed</span><h1 style={{ marginTop: '.6rem' }}>Order #{placed.number}</h1></div>
        <div style={{ padding: '1rem' }}><div className="card">
          {placed.status === 'Cancelled' ? <p className="err">This order was cancelled. Please ask a staff member.</p> :
            <div className="track">{STEPS.map((s, i) => <div key={s} className={i <= idx ? 'done' : ''}><i>{i <= idx ? '✓' : i + 1}</i>{s}</div>)}</div>}
          <p className="muted">Table {placed.table} · updates live</p>
          {placed.items.map((i, k) => <div key={k} className="row spread" style={{ flexWrap: 'nowrap' }}><span>{i.qty}× {i.name}{i.size ? ` (${i.size})` : ''}</span><span>{cur}{i.qty * i.price}</span></div>)}
          <hr /><div className="row spread"><span className="muted">Tax</span><span>{cur}{placed.tax}</span></div>
          <div className="row spread"><b>Total</b><b>{cur}{placed.total}</b></div>
          <button className="btn ghost block" style={{ marginTop: '1rem' }} onClick={() => setPlaced(null)}>Order more</button>
        </div></div></div>
    );
  }

  return (
    <div className="g-wrap">
      <div className="g-hero">
        <Link href={`/${slug}`} className="muted" style={{ color: 'rgba(255,255,255,.7)' }}>← {data.restaurant.name} home</Link>
        <h1 style={{ marginTop: '.5rem' }}>{typeInfo(data.restaurant.businessType).emoji} {data.restaurant.name}</h1>
        <div className="row" style={{ gap: '.5rem' }}><span className="table-pill"><Icon name="qr" size={14} /> Table {table}</span><span className="table-pill">{typeInfo(data.restaurant.businessType).label}</span>{data.restaurant.cuisine && <span className="table-pill">{data.restaurant.cuisine}</span>}</div>
      </div>
      <div className="g-search">
        <Icon name="search" size={18} style={{ marginLeft: 8, color: 'var(--muted)' }} />
        <input placeholder="Search dishes…" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="vegtoggle"><input type="checkbox" checked={veg} onChange={(e) => setVeg(e.target.checked)} /> VEG</label>
      </div>
      <div className="chips">
        <button className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>All</button>
        {data.categories.map((c) => <button key={c._id} className={`chip ${cat === c._id ? 'on' : ''}`} onClick={() => setCat(c._id)}>{c.name}</button>)}
      </div>

      <div className="g-section">
        {sections.map(({ c, list }) => (
          <div key={c._id}><h3>{c.name}</h3>
            {list.map((i) => (
              <div key={i._id} className={`dish ${i.available ? '' : 'off'}`}>
                <Thumb i={i} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <h4><span className={`veg-dot ${i.veg ? '' : 'nonveg'}`} />{i.name}</h4>
                  <div className="desc">{i.description}</div>
                  <div style={{ margin: '.25rem 0' }}>{i.tags?.map((t) => <span key={t} className="badge" style={{ marginRight: 4 }}>{t}</span>)}</div>
                  <div className="row spread" style={{ marginTop: 'auto' }}>
                    <b>{i.sizes?.length ? 'from ' : ''}{cur}{i.sizes?.length ? Math.min(...i.sizes.map((s) => s.price)) : i.price}</b>
                    {i.available ? <button className="btn sm" onClick={() => setPick({ item: i, size: i.sizes?.[0]?.name, addons: [], note: '', qty: 1 })}><Icon name="plus" size={14} /> Add</button> : <span className="badge Cancelled">Sold out</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {!sections.length && <div className="empty">No dishes match your search.</div>}
      </div>
      <p className="muted" style={{ textAlign: 'center', marginTop: '2rem' }}>Powered by OmniBite by Avocado Technologies</p>

      {pick && (() => {
        const sz = pick.item.sizes?.find((s) => s.name === pick.size);
        const unit = (sz ? sz.price : pick.item.price) + pick.addons.reduce((s, n) => s + (pick.item.addons.find((a) => a.name === n)?.price || 0), 0);
        return (
          <div className="modal" onClick={() => setPick(null)}><div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3><span className={`veg-dot ${pick.item.veg ? '' : 'nonveg'}`} />{pick.item.name}</h3>
            <p className="muted">{pick.item.description}</p>
            {pick.item.sizes?.length > 0 && <><label>Choose size</label>{pick.item.sizes.map((s) => <label key={s.name} className="opt"><input type="radio" name="size" checked={pick.size === s.name} onChange={() => setPick({ ...pick, size: s.name })} /><span style={{ flex: 1 }}>{s.name}</span><b>{cur}{s.price}</b></label>)}</>}
            {pick.item.addons?.length > 0 && <><label>Add-ons</label>{pick.item.addons.map((a) => <label key={a.name} className="opt"><input type="checkbox" checked={pick.addons.includes(a.name)} onChange={(e) => setPick({ ...pick, addons: e.target.checked ? [...pick.addons, a.name] : pick.addons.filter((x) => x !== a.name) })} /><span style={{ flex: 1 }}>{a.name}</span><b>+{cur}{a.price}</b></label>)}</>}
            <label>Special instructions</label><input value={pick.note} onChange={(e) => setPick({ ...pick, note: e.target.value })} placeholder="Less spicy, no onion…" />
            <div className="row spread" style={{ marginTop: '1.2rem' }}>
              <div className="qty"><button onClick={() => setPick({ ...pick, qty: Math.max(1, pick.qty - 1) })}>−</button><b>{pick.qty}</b><button onClick={() => setPick({ ...pick, qty: pick.qty + 1 })}>+</button></div>
              <button className="btn lg" onClick={() => { setCart([...cart, { ...pick, unit }]); setPick(null); }}>Add to order · {cur}{unit * pick.qty}</button>
            </div>
          </div></div>
        );
      })()}

      {count > 0 && !showCart && <button className="cartbar" onClick={() => setShowCart(true)}><span><Icon name="bag" size={18} style={{ verticalAlign: -3 }} /> {count} item{count > 1 ? 's' : ''}</span><span>View order · {cur}{subtotal.toFixed(0)}</span></button>}

      {showCart && (
        <div className="modal" onClick={() => setShowCart(false)}><div className="sheet" onClick={(e) => e.stopPropagation()}>
          <h3>Your order · Table {table}</h3>
          {cart.map((c, k) => (
            <div key={k} className="row spread" style={{ padding: '.5rem 0', borderBottom: '1px solid var(--line)', flexWrap: 'nowrap' }}>
              <div><b>{c.qty}× {c.item.name}</b>{c.size && ` (${c.size})`}<div className="muted">{[...c.addons, c.note].filter(Boolean).join(' · ')}</div></div>
              <div className="row" style={{ flexWrap: 'nowrap', gap: '.5rem' }}><b>{cur}{c.unit * c.qty}</b><button className="btn ghost sm" aria-label="Remove" onClick={() => { const n = cart.filter((_, i) => i !== k); setCart(n); if (!n.length) setShowCart(false); }}><Icon name="x" size={13} /></button></div>
            </div>
          ))}
          <div className="row spread" style={{ marginTop: '.8rem' }}><span className="muted">Subtotal</span><span>{cur}{subtotal.toFixed(2)}</span></div>
          <div className="row spread"><span className="muted">Tax ({data.restaurant.taxRate}%)</span><span>{cur}{tax.toFixed(2)}</span></div>
          <div className="row spread" style={{ fontSize: '1.1rem' }}><b>Total</b><b>{cur}{(subtotal + tax).toFixed(2)}</b></div>
          <label>Your name (optional)</label><input value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn lg block" style={{ marginTop: '1.1rem' }} onClick={place} disabled={busy}>{busy ? 'Placing…' : 'Place order'}</button>
        </div></div>
      )}
    </div>
  );
}

export default function PublicMenu() {
  return <Suspense fallback={<div className="center"><span className="spinner" /></div>}><Menu /></Suspense>;
}
