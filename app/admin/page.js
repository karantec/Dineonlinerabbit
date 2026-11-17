'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/Icon';
import Brand from '@/components/Brand';
import PlanModal from '@/components/PlanModal';
import { BUSINESS_TYPES, PLANS, fmtDate } from '@/lib/subscription';

const json = { 'Content-Type': 'application/json' };
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Admin() {
  const router = useRouter();
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modal, setModal] = useState(null); // { mode, restaurant? }

  const load = async () => {
    const r = await fetch('/api/admin/restaurants');
    if (r.status === 401 || r.status === 403) return router.push('/login');
    setD(await r.json());
  };
  useEffect(() => { load(); }, []);

  function report(j, verb) {
    if (j.tempPassword) setMsg(`${verb}. Email isn't configured, so give the owner this temporary password: ${j.tempPassword}`);
    else if (j.ownerCreated) setMsg(`${verb}. A welcome email with login details was sent to the owner.`);
    else setMsg(`${verb}.`);
  }

  // Used by the plan modal. Returns an error string or undefined.
  async function submitPlan(body) {
    const url = modal.mode === 'add' ? '/api/admin/restaurants' : `/api/admin/restaurants/${modal.restaurant._id}`;
    const r = await fetch(url, { method: modal.mode === 'add' ? 'POST' : 'PATCH', headers: json, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) return j.error || 'Something went wrong';
    const verbs = { add: 'Customer added', approve: 'Approved and activated', reactivate: 'Reactivated', renew: 'Subscription renewed' };
    report(j, verbs[modal.mode]);
    setModal(null); load();
  }

  async function simple(id, action) {
    let reason;
    if (action === 'suspend' || action === 'reject') { reason = prompt('Reason (shown to the restaurant):'); if (reason === null) return; }
    await fetch(`/api/admin/restaurants/${id}`, { method: 'PATCH', headers: json, body: JSON.stringify({ action, reason }) });
    setMsg(action === 'suspend' ? 'Restaurant suspended.' : 'Request rejected.'); load();
  }
  async function setType(id, businessType) {
    await fetch(`/api/admin/restaurants/${id}`, { method: 'PATCH', headers: json, body: JSON.stringify({ action: 'update', businessType }) });
    load();
  }
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); router.refresh(); }

  if (!d) return <div className="main" style={{ margin: '0 auto' }}><div className="skel" style={{ height: 120, marginBottom: 16 }} /><div className="skel" style={{ height: 320 }} /></div>;
  const s = d.stats;
  const rows = d.restaurants.filter((r) => (filter === 'all' || r.effective === filter) && (typeFilter === 'all' || r.businessType === typeFilter));
  const cards = [
    ['store', 'Customers', s.total], ['check', 'Active', s.active], ['clock', 'Pending requests', s.pending], ['shield', 'Expired', s.expired],
    ['bag', 'Total orders', s.orders.toLocaleString('en-IN')], ['trending', 'Platform GMV', inr(s.gmv)], ['wallet', 'Subscription revenue', inr(s.subscriptionRevenue)],
  ];

  return (
    <>
      <div className="topbar" style={{ position: 'static' }}>
        <Brand />
        <div className="row"><span className="badge">Super Admin</span><button className="btn ghost sm" onClick={logout}><Icon name="logout" size={15} /> Logout</button></div>
      </div>
      <div className="main" style={{ margin: '0 auto' }}>
        <div className="page-head">
          <div><h1>Platform Console</h1><p>Approve customers, manage subscriptions and monitor the platform.</p></div>
          <button className="btn" onClick={() => setModal({ mode: 'add' })}><Icon name="plus" size={16} /> Add customer</button>
        </div>
        {msg && <div className="card" style={{ background: 'var(--brand-100)', marginBottom: '1rem' }}>{msg}</div>}

        <div className="grid cols-4" style={{ marginBottom: '1rem' }}>
          {cards.map(([ic, k, v]) => <div className="card stat-card" key={k}><div className="stat-ico"><Icon name={ic} size={22} /></div><div><div className="muted">{k}</div><div className="stat">{v}</div></div></div>)}
        </div>

        <div className="card" style={{ overflowX: 'auto' }}>
          <div className="row spread" style={{ marginBottom: '.7rem' }}>
            <h3 style={{ margin: 0 }}>Customers</h3>
            <div className="row">
              <select style={{ width: 'auto' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All categories</option>{BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.plural}</option>)}
              </select>
              <div className="tabs">{['all', 'pending', 'active', 'expired', 'suspended'].map((f) => <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>)}</div>
            </div>
          </div>
          <table>
            <thead><tr><th>Customer</th><th>Category</th><th>Plan</th><th>Valid until</th><th>Status</th><th>Orders</th><th>GMV</th><th>Actions</th></tr></thead>
            <tbody>{rows.map((r) => {
              const sub = r.subscription;
              return (
                <tr key={r._id}>
                  <td><b>{r.name}</b><div className="muted">{r.ownerName} · {r.email}</div>
                    <div className="muted">{r.effective === 'active' ? <Link href={`/${r.slug}`} target="_blank" style={{ color: 'var(--brand)' }}>/{r.slug} ↗ landing page</Link> : `/${r.slug}`}</div></td>
                  <td>
                    <select value={r.businessType || 'restaurant'} onChange={(e) => setType(r._id, e.target.value)} style={{ padding: '.3rem .5rem', width: 'auto', fontSize: '.8rem' }} aria-label="Customer category">
                      {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                    </select>
                  </td>
                  <td>{sub?.plan ? <><span className={`badge ${sub.plan === 'trial' ? 'Pending' : ''}`}>{PLANS[sub.plan].short}</span><div className="muted">{sub.plan === 'yearly' ? inr(sub.amount) : 'Free trial'}</div></> : <span className="muted">—</span>}</td>
                  <td>{sub?.endDate ? <><b>{fmtDate(sub.endDate)}</b><div className="muted" style={{ color: r.daysLeft <= 0 ? 'var(--danger)' : r.daysLeft <= 7 ? 'var(--warn)' : undefined }}>{r.daysLeft > 0 ? `${r.daysLeft} days left` : 'Expired'}</div><div className="muted">from {fmtDate(sub.startDate)}</div></> : <span className="muted">—</span>}</td>
                  <td><span className={`badge ${r.effective}`}>{r.effective}</span>{r.statusReason && <div className="muted">{r.statusReason}</div>}</td>
                  <td>{r.orders}</td><td>{inr(r.gmv)}</td>
                  <td><div className="row" style={{ gap: '.35rem' }}>
                    {r.effective === 'pending' && <><button className="btn sm" onClick={() => setModal({ mode: 'approve', restaurant: r })}>Approve</button><button className="btn danger sm" onClick={() => simple(r._id, 'reject')}>Reject</button></>}
                    {r.effective === 'active' && <><button className="btn ghost sm" onClick={() => setModal({ mode: 'renew', restaurant: r })}>Renew</button><button className="btn ghost sm" style={{ color: 'var(--danger)' }} onClick={() => simple(r._id, 'suspend')}>Suspend</button></>}
                    {['expired', 'suspended', 'rejected'].includes(r.effective) && <button className="btn sm" onClick={() => setModal({ mode: 'reactivate', restaurant: r })}><Icon name="bolt" size={13} /> Reactivate</button>}
                  </div></td>
                </tr>);
            })}</tbody>
          </table>
          {!rows.length && <div className="empty">No customers in this view.</div>}
        </div>
      </div>
      {modal && <PlanModal mode={modal.mode} restaurant={modal.restaurant} onClose={() => setModal(null)} onSubmit={submitPlan} />}
    </>
  );
}
