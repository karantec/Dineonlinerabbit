'use client';
import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { BUSINESS_TYPES, PLANS, parseDay, computeEnd, todayIST, fmtDate, isLive } from '@/lib/subscription';

const TITLES = { approve: 'Approve & activate', reactivate: 'Reactivate', renew: 'Renew subscription', add: 'Add customer' };

/**
 * mode: 'approve' | 'reactivate' | 'renew' | 'add'
 * onSubmit(body) -> resolves to an error string, or falsy on success.
 */
export default function PlanModal({ mode, restaurant, onClose, onSubmit }) {
  const canKeep = mode === 'reactivate' && restaurant && isLive({ status: 'active', subscription: restaurant.subscription });
  const [f, setF] = useState({
    name: '', ownerName: '', email: '', phone: '', address: '',
    businessType: restaurant?.businessType || 'restaurant',
    plan: canKeep ? 'keep' : 'yearly', amount: '', startDate: todayIST(),
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const end = useMemo(() => {
    const s = parseDay(f.startDate);
    return s && f.plan !== 'keep' ? computeEnd(s, f.plan) : null;
  }, [f.startDate, f.plan]);

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    const e2 = await onSubmit({ ...f, action: mode === 'add' ? undefined : mode });
    if (e2) { setErr(e2); setBusy(false); }
  }

  return (
    <div className="modal" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ maxWidth: 560 }}>
        <div className="row spread">
          <div><h3 style={{ margin: 0 }}>{TITLES[mode]}</h3>{restaurant && <div className="muted">{restaurant.name}</div>}</div>
          <button type="button" className="btn ghost sm" onClick={onClose} aria-label="Close"><Icon name="x" size={14} /></button>
        </div>

        {mode === 'add' && (
          <>
            <label>Business name *</label><input required value={f.name} onChange={set('name')} placeholder="e.g. Sharma Family Restaurant" />
            <div className="row" style={{ gap: '.7rem', flexWrap: 'nowrap' }}>
              <div style={{ flex: 1 }}><label>Owner name</label><input value={f.ownerName} onChange={set('ownerName')} /></div>
              <div style={{ flex: 1 }}><label>Phone</label><input value={f.phone} onChange={set('phone')} /></div>
            </div>
            <label>Owner email * (login is sent here)</label><input type="email" required value={f.email} onChange={set('email')} />
            <label>Address</label><input value={f.address} onChange={set('address')} />
          </>
        )}

        <label>Customer category</label>
        <div className="seg">
          {BUSINESS_TYPES.map((t) => (
            <button type="button" key={t.value} className={f.businessType === t.value ? 'on' : ''} onClick={() => setF({ ...f, businessType: t.value })}>{t.emoji} {t.label}</button>
          ))}
        </div>

        <label>Plan</label>
        <div className="plan-grid">
          <button type="button" className={`plan-opt ${f.plan === 'trial' ? 'on' : ''}`} onClick={() => setF({ ...f, plan: 'trial', amount: '' })}>
            <b>1-month trial</b><span>Free · ends 1 month after start</span>
          </button>
          <button type="button" className={`plan-opt ${f.plan === 'yearly' ? 'on' : ''}`} onClick={() => setF({ ...f, plan: 'yearly' })}>
            <b>1-year subscription</b><span>Paid · ends exactly 1 year after start</span>
          </button>
          {canKeep && (
            <button type="button" className={`plan-opt ${f.plan === 'keep' ? 'on' : ''}`} onClick={() => setF({ ...f, plan: 'keep' })}>
              <b>Keep current plan</b><span>Valid till {fmtDate(restaurant.subscription.endDate)}</span>
            </button>
          )}
        </div>

        {f.plan === 'yearly' && (
          <><label>Amount received (₹) *</label><input type="number" min="1" step="any" required value={f.amount} onChange={set('amount')} placeholder="e.g. 24000" /></>
        )}

        {f.plan !== 'keep' && (
          <div className="row" style={{ gap: '.7rem', flexWrap: 'nowrap' }}>
            <div style={{ flex: 1 }}><label>Start date (activation)</label><input type="date" required value={f.startDate} onChange={set('startDate')} /></div>
            <div style={{ flex: 1 }}><label>End date (automatic)</label><input readOnly value={end ? fmtDate(end) : '—'} style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', fontWeight: 700 }} /></div>
          </div>
        )}
        {f.plan !== 'keep' && <p className="muted" style={{ marginTop: '.4rem' }}>Change the start date and the end date updates automatically{f.plan === 'yearly' ? ' to exactly one year later' : ' to one month later'}.</p>}

        {err && <div className="err">{err}</div>}
        <div className="row" style={{ marginTop: '1.2rem' }}>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : TITLES[mode]}</button>
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
