import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { RestaurantModel } from '@/lib/models';
import { isLive, daysLeft, fmtDate, typeInfo, PLANS } from '@/lib/subscription';
import Icon from '@/components/Icon';
import Sidebar from './Sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const s = await getSession();
  if (!s || s.role === 'superadmin' || !s.rid) redirect('/login');
  await connectDB();
  const r = await RestaurantModel.findById(s.rid).select('name slug businessType status subscription').lean();
  if (!r || !isLive(r)) redirect('/login'); // suspended or subscription expired
  const t = typeInfo(r.businessType);
  const left = daysLeft(r);
  const plan = r.subscription?.plan && PLANS[r.subscription.plan];

  return (
    <div className="shell">
      <Sidebar role={s.role} name={s.name || 'User'} restaurant={r.name} typeLabel={t.label} typeEmoji={t.emoji} />
      <div className="content">
        <div className="topbar no-print">
          <div className="row" style={{ gap: '.6rem' }}>
            <b style={{ fontSize: '1.05rem' }}>{r.name}</b>
            <span className="badge">{t.emoji} {t.label}</span>
            {plan && left !== null && <span className={`badge ${left <= 7 ? 'Pending' : ''}`}>{plan.short} · {left} day{left === 1 ? '' : 's'} left</span>}
          </div>
          <div className="row" style={{ gap: '.5rem' }}>
            <Link href={`/${r.slug}`} target="_blank" className="btn ghost sm"><Icon name="store" size={15} /> Landing page</Link>
            <Link href={`/${r.slug}/menu?table=1`} target="_blank" className="btn ghost sm"><Icon name="external" size={15} /> Live menu</Link>
            <Link href="/dashboard/qr" className="btn sm"><Icon name="qr" size={15} /> Generate QR codes</Link>
          </div>
        </div>
        <div className="main">
          {left !== null && left <= 7 && (
            <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--warn)', background: '#2a2110' }}>
              <b style={{ color: 'var(--warn)' }}>Your {plan?.label || 'plan'} ends on {fmtDate(r.subscription.endDate)} ({left} day{left === 1 ? '' : 's'} left).</b>
              <div className="muted">Contact OmniBite by Avocado Technologies to renew so your menu and orders keep working.</div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
