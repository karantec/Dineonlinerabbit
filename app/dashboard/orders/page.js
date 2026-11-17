'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Icon from '@/components/Icon';

const FLOW = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];
const nextOf = (s) => FLOW[FLOW.indexOf(s) + 1];
const ago = (d) => { const m = Math.max(0, Math.round((Date.now() - new Date(d)) / 60000)); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`; };

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [view, setView] = useState('kanban');
  const [rid, setRid] = useState(null);
  const [cur, setCur] = useState('₹');
  const [fresh, setFresh] = useState({});
  const [, tick] = useState(0);
  const audio = useRef(null);

  useEffect(() => {
    fetch('/api/orders').then((r) => r.json()).then((d) => setOrders(d.orders || []));
    fetch('/api/settings').then((r) => r.json()).then((d) => { setRid(d.restaurant._id); setCur(d.restaurant.currency); });
    const t = setInterval(() => tick((n) => n + 1), 30000); // refresh "x min ago"
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!rid) return;
    const s = io();
    s.on('connect', () => s.emit('join:restaurant', rid));
    s.on('order:new', (o) => {
      setOrders((p) => [o, ...(p || [])]);
      setFresh((f) => ({ ...f, [o._id]: true }));
      setTimeout(() => setFresh((f) => { const n = { ...f }; delete n[o._id]; return n; }), 4000);
      chime();
    });
    s.on('order:update', (o) => setOrders((p) => (p || []).map((x) => (x._id === o._id ? o : x))));
    return () => s.disconnect();
  }, [rid]);

  function chime() {
    try {
      const c = (audio.current ||= new (window.AudioContext || window.webkitAudioContext)());
      [880, 1175].forEach((f, i) => {
        const o = c.createOscillator(); const g = c.createGain();
        o.connect(g); g.connect(c.destination); o.frequency.value = f; g.gain.value = 0.12;
        o.start(c.currentTime + i * 0.18); o.stop(c.currentTime + i * 0.18 + 0.16);
      });
    } catch {}
  }

  async function setStatus(id, status) {
    setOrders((p) => p.map((x) => (x._id === id ? { ...x, status } : x))); // optimistic
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  }

  async function receipt(o) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: [80, 50 + o.items.length * 7] });
    let y = 10;
    doc.setFontSize(13); doc.text(`Order #${o.number}`, 40, y, { align: 'center' }); y += 6;
    doc.setFontSize(9); doc.text(`Table ${o.table}  |  ${new Date(o.createdAt).toLocaleString()}`, 40, y, { align: 'center' }); y += 8;
    o.items.forEach((i) => { doc.text(`${i.qty} x ${i.name}${i.size ? ` (${i.size})` : ''}`, 5, y); doc.text(`${i.qty * i.price}`, 75, y, { align: 'right' }); y += 6; });
    y += 2; doc.text('Subtotal', 5, y); doc.text(`${o.subtotal}`, 75, y, { align: 'right' }); y += 5;
    doc.text('Tax', 5, y); doc.text(`${o.tax}`, 75, y, { align: 'right' }); y += 6;
    doc.setFontSize(11); doc.text('Total', 5, y); doc.text(`${o.total}`, 75, y, { align: 'right' });
    doc.save(`order-${o.number}.pdf`);
  }

  if (!orders) return <div className="skel" style={{ height: 320 }} />;

  const active = orders.filter((o) => !['Completed', 'Cancelled'].includes(o.status));
  const actions = (o) => (
    <div className="row" style={{ gap: '.35rem' }}>
      {nextOf(o.status) && o.status !== 'Cancelled' && <button className="btn sm" onClick={() => setStatus(o._id, nextOf(o.status))}>{nextOf(o.status)} <Icon name="arrow" size={13} /></button>}
      {['Pending', 'Accepted'].includes(o.status) && <button className="btn danger sm" onClick={() => setStatus(o._id, 'Cancelled')}>Cancel</button>}
      <button className="btn ghost sm" onClick={() => receipt(o)} title="Download receipt"><Icon name="download" size={13} /> PDF</button>
    </div>
  );
  const card = (o) => (
    <div key={o._id} className={`kcard ${fresh[o._id] ? 'fresh' : ''}`}>
      <div className="row spread"><b>#{o.number} · Table {o.table}</b><span className="muted"><Icon name="clock" size={12} /> {ago(o.createdAt)}</span></div>
      {o.customerName && <div className="muted">{o.customerName}</div>}
      <div style={{ margin: '.45rem 0' }}>{o.items.map((i, k) => <div key={k}>{i.qty}× <b>{i.name}</b>{i.size && ` (${i.size})`}{(i.addons?.length > 0 || i.note) && <div className="muted">{[...(i.addons || []), i.note && `“${i.note}”`].filter(Boolean).join(' · ')}</div>}</div>)}</div>
      <div className="row spread"><b>{cur}{o.total}</b>{actions(o)}</div>
    </div>
  );

  return (
    <>
      <div className="page-head">
        <div><h1>Orders · Kitchen Display</h1><p><span className="live-dot" /> Live. New orders appear instantly. {active.length} active.</p></div>
        <div className="tabs"><button className={view === 'kanban' ? 'on' : ''} onClick={() => setView('kanban')}>Kanban</button><button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>Table</button></div>
      </div>
      {view === 'kanban' ? (
        <div className="kanban">{FLOW.slice(0, 4).map((st) => {
          const list = active.filter((o) => o.status === st);
          return <div className="kcol" key={st}><div className="kcol-h"><span>{st}</span><span className={`badge ${st}`}>{list.length}</span></div>{list.map(card)}{!list.length && <div className="muted" style={{ textAlign: 'center', padding: '1rem' }}>No orders</div>}</div>;
        })}</div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}><table>
          <thead><tr><th>#</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th><th /></tr></thead>
          <tbody>{orders.slice(0, 100).map((o) => (
            <tr key={o._id}><td><b>{o.number}</b></td><td>{o.table}</td><td>{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</td><td>{cur}{o.total}</td><td><span className={`badge ${o.status}`}>{o.status}</span></td><td className="muted">{new Date(o.createdAt).toLocaleString()}</td><td>{actions(o)}</td></tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}
