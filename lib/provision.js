import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserModel } from '@/lib/models';
import { sendEmail, welcomeEmail } from '@/lib/email';
import { BUSINESS_TYPES, PLANS, parseDay, computeEnd, todayIST } from '@/lib/subscription';

export const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const RESERVED = ['admin', 'dashboard', 'login', 'register', 'api', 'icon', 'favicon', 'robots', 'sitemap', '_next'];
export const validType = (t) => (BUSINESS_TYPES.some((b) => b.value === t) ? t : null);

/** Validates { plan, amount, startDate } from the admin form. Returns { sub } or { error }. */
export function buildSubscription({ plan, amount, startDate }) {
  if (!PLANS[plan]) return { error: 'Choose a plan: 1-month trial or 1-year subscription' };
  const start = parseDay(startDate || todayIST());
  if (!start) return { error: 'Invalid start date' };
  let amt = 0;
  if (plan === 'yearly') {
    amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return { error: 'Enter the subscription amount received (₹)' };
  }
  return { sub: { plan, amount: Math.round(amt * 100) / 100, startDate: start, endDate: computeEnd(start, plan) } };
}

/** Sets the subscription on a restaurant document and marks it active. Caller must save(). */
export function applySubscription(r, sub) {
  r.subscription = sub;
  r.subscriptionHistory.push({ ...sub, at: new Date() });
  r.status = 'active';
  r.statusReason = undefined;
}

/** Creates the owner login if the restaurant has none and emails the credentials. */
export async function ensureOwner(r) {
  if (await UserModel.exists({ restaurant: r._id, role: 'owner' })) return { created: false };
  const tempPassword = crypto.randomBytes(5).toString('hex');
  await UserModel.create({ name: r.ownerName || r.name, email: r.email, password: await bcrypt.hash(tempPassword, 10), role: 'owner', restaurant: r._id });
  const mail = welcomeEmail({ name: r.ownerName || 'there', restaurant: r.name, email: r.email, password: tempPassword, url: process.env.NEXT_PUBLIC_APP_URL || '', sub: r.subscription });
  const emailSent = await sendEmail({ to: r.email, ...mail });
  return { created: true, emailSent, tempPassword: emailSent ? undefined : tempPassword };
}
