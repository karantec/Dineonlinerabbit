import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { UserModel, RestaurantModel } from '@/lib/models';
import { signToken, json } from '@/lib/auth';
import { effectiveStatus, fmtDate } from '@/lib/subscription';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();
  const user = await UserModel.findOne({ email: String(email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password))) return json({ error: 'Invalid email or password' }, 401);

  if (user.role !== 'superadmin') {
    const r = await RestaurantModel.findById(user.restaurant).lean();
    const st = r ? effectiveStatus(r) : 'rejected';
    if (st === 'suspended') return json({ error: `Account suspended${r.statusReason ? `: ${r.statusReason}` : ''}. Please contact OmniBite.` }, 403);
    if (st === 'expired') return json({ error: `Your subscription expired on ${fmtDate(r.subscription?.endDate)}. Please contact OmniBite to renew.` }, 403);
    if (st !== 'active') return json({ error: 'Your restaurant is not active yet.' }, 403);
  }
  const token = await signToken({ uid: String(user._id), role: user.role, rid: user.restaurant ? String(user.restaurant) : null, name: user.name });
  const res = NextResponse.json({ role: user.role });
  res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7, secure: process.env.NODE_ENV === 'production' });
  return res;
}
