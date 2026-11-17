// Pure helpers (safe to import from both server and client code).

export const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant', plural: 'Restaurants', emoji: '🍽️', tagline: 'Fresh flavours, served right at your table' },
  { value: 'cafe', label: 'Cafe', plural: 'Cafes', emoji: '☕', tagline: 'Great coffee, fresh bakes and good company' },
  { value: 'dhaba', label: 'Dhaba', plural: 'Dhabas', emoji: '🍛', tagline: 'Authentic dhaba taste, straight from the tandoor' },
];
export const typeInfo = (v) => BUSINESS_TYPES.find((t) => t.value === v) || BUSINESS_TYPES[0];

export const PLANS = {
  trial: { label: '1-month trial', short: 'Trial' },
  yearly: { label: '1-year subscription', short: 'Yearly' },
};

/** 'YYYY-MM-DD' -> Date at UTC midnight, or null */
export function parseDay(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Adds calendar months, clamping the day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date, n) {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}

/** Trial = start + 1 month, yearly = start + exactly 1 year. */
export const computeEnd = (start, plan) => addMonths(start, plan === 'trial' ? 1 : 12);

/** Today's date in India as YYYY-MM-DD */
export const todayIST = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
export const toDay = (d) => new Date(d).toISOString().slice(0, 10);
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—');

/** A restaurant is live if approved AND its subscription's last day hasn't passed. */
export function isLive(r, now = Date.now()) {
  if (!r || r.status !== 'active') return false;
  const end = r.subscription?.endDate;
  return !end || now < new Date(end).getTime() + 864e5;
}
export function daysLeft(r, now = Date.now()) {
  const end = r?.subscription?.endDate;
  return end ? Math.ceil((new Date(end).getTime() + 864e5 - now) / 864e5) : null;
}
/** pending | active | suspended | rejected | expired */
export const effectiveStatus = (r) => (r.status === 'active' && !isLive(r) ? 'expired' : r.status);
