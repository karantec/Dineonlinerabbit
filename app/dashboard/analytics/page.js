'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import Icon from '@/components/Icon';
import { BRAND, PALETTE, GRID, AXIS, TOOLTIP } from '@/lib/theme';

const STATUS_COLOR = { Completed: '#8c9850', Pending: '#e8b04a', Accepted: '#a58bff', Preparing: '#5aa2ff', Ready: '#4fd18b', Cancelled: '#ff7a6b' };
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function Delta({ v }) {
  if (v === null || v === undefined) return null;
  return <span className={`delta ${v >= 0 ? 'up' : 'down'}`}>{v >= 0 ? '▲' : '▼'} {Math.abs(v)}%</span>;
}

export default function Analytics() {
  const [days, setDays] = useState(14);
  const [d, setD] = useState(null);

  useEffect(() => {
    let live = true;
    setD(null);
    fetch(`/api/analytics?days=${days}`).then((r) => r.json()).then((x) => live && setD(x));
    return () => { live = false; };
  }, [days]);

  const head = (
    <div className="page-head">
      <div><h1>Analytics & Reports</h1><p>How your restaurant is performing.</p></div>
      <select style={{ width: 'auto' }} value={days} onChange={(e) => setDays(+e.target.value)}>
        <option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
      </select>
    </div>
  );

  const banner = (
    <div className="qr-banner">
      <div className="qr-ico"><Icon name="qr" size={28} /></div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <h3>Generate QR codes for your tables</h3>
        <p>Open <b>QR Codes</b> in the sidebar (or use this button), choose your tables, then download or print the cards.</p>
      </div>
      <Link href="/dashboard/qr" className="btn light">Open QR Studio <Icon name="arrow" size={16} /></Link>
    </div>
  );

  if (!d) return (<>{head}{banner}<div className="grid cols-4" style={{ marginBottom: 16 }}>{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 88 }} />)}</div><div className="skel" style={{ height: 300 }} /></>);
  if (d.error) return <p className="err">{d.error}</p>;

  const tick = { fontSize: 11, fill: AXIS };
  return (
    <>
      {head}{banner}
      <div className="grid cols-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat-card"><div className="stat-ico"><Icon name="wallet" size={22} /></div><div><div className="muted">Revenue</div><div className="stat">{inr(d.revenue)}</div><Delta v={d.revenueDelta} /></div></div>
        <div className="card stat-card"><div className="stat-ico"><Icon name="bag" size={22} /></div><div><div className="muted">Orders</div><div className="stat">{d.orders}</div><Delta v={d.ordersDelta} /></div></div>
        <div className="card stat-card"><div className="stat-ico"><Icon name="trending" size={22} /></div><div><div className="muted">Avg. order value</div><div className="stat">{inr(d.avgOrder)}</div></div></div>
        <div className="card stat-card"><div className="stat-ico"><Icon name="flame" size={22} /></div><div><div className="muted">Best seller</div><div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{d.top[0]?.name || '—'}</div><div className="muted">{d.top[0] ? `${d.top[0].qty} sold` : ''}</div></div></div>
      </div>

      <div className="grid cols-2">
        <div className="card"><h3>Revenue trend</h3>
          <div style={{ height: 270 }}><ResponsiveContainer><AreaChart data={d.daily}>
            <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={BRAND} stopOpacity={0.35} /><stop offset="100%" stopColor={BRAND} stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} /><XAxis dataKey="date" tickFormatter={(s) => s.slice(5)} tick={tick} tickLine={false} /><YAxis tick={tick} tickLine={false} axisLine={false} width={48} />
            <Tooltip {...TOOLTIP} formatter={(v) => inr(v)} /><Area type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={2.5} fill="url(#g)" />
          </AreaChart></ResponsiveContainer></div></div>

        <div className="card"><h3>Orders per day</h3>
          <div style={{ height: 270 }}><ResponsiveContainer><BarChart data={d.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} /><XAxis dataKey="date" tickFormatter={(s) => s.slice(5)} tick={tick} tickLine={false} /><YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
            <Tooltip {...TOOLTIP} /><Bar dataKey="orders" fill={BRAND} radius={[6, 6, 0, 0]} />
          </BarChart></ResponsiveContainer></div></div>

        <div className="card"><h3>Peak hours</h3><p className="muted">Orders by hour of day (IST)</p>
          <div style={{ height: 230 }}><ResponsiveContainer><BarChart data={d.hourly}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} /><XAxis dataKey="hour" tick={tick} tickLine={false} interval={1} /><YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
            <Tooltip {...TOOLTIP} /><Bar dataKey="orders" fill={PALETTE[1]} radius={[6, 6, 0, 0]} />
          </BarChart></ResponsiveContainer></div></div>

        <div className="card"><h3>Order status mix</h3>
          <div style={{ height: 270 }}><ResponsiveContainer><PieChart>
            <Pie data={d.byStatus} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>{d.byStatus.map((s, i) => <Cell key={s.name} fill={STATUS_COLOR[s.name] || PALETTE[i % PALETTE.length]} />)}</Pie>
            <Tooltip {...TOOLTIP} /><Legend wrapperStyle={{ color: AXIS }} />
          </PieChart></ResponsiveContainer></div></div>

        <div className="card"><h3>Top-selling items</h3>
          {d.top.length ? <table><thead><tr><th>Dish</th><th>Qty</th><th>Revenue</th></tr></thead><tbody>{d.top.map((t, i) => <tr key={t.name}><td><b>{i + 1}.</b> {t.name}</td><td>{t.qty}</td><td>{inr(t.revenue)}</td></tr>)}</tbody></table> : <div className="empty">No sales in this period yet.</div>}</div>

        <div className="card"><div className="row spread"><h3>Recent orders</h3><Link href="/dashboard/orders" className="btn ghost sm">Open KDS</Link></div>
          {d.recent.length ? <table><thead><tr><th>#</th><th>Table</th><th>Total</th><th>Status</th></tr></thead><tbody>{d.recent.map((o) => <tr key={o._id}><td>{o.number}</td><td>{o.table}</td><td>{inr(o.total)}</td><td><span className={`badge ${o.status}`}>{o.status}</span></td></tr>)}</tbody></table> : <div className="empty">No orders yet.</div>}</div>
      </div>
    </>
  );
}
