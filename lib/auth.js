import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { RestaurantModel } from '@/lib/models';
import { isLive } from '@/lib/subscription';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

export async function signToken(payload) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret());
}

export async function getSession() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret())).payload; } catch { return null; }
}

export const json = (data, status = 200) => NextResponse.json(data, { status });

// Returns { session } or { error: NextResponse }.
// Restaurant users are also blocked immediately when their restaurant is suspended or the subscription has expired.
export async function requireAuth(roles) {
  const session = await getSession();
  if (!session) return { error: json({ error: 'Unauthorized' }, 401) };
  if (roles && !roles.includes(session.role)) return { error: json({ error: 'Forbidden' }, 403) };
  if (session.role !== 'superadmin') {
    await connectDB();
    const r = await RestaurantModel.findById(session.rid).select('status subscription.endDate').lean();
    if (!isLive(r)) return { error: json({ error: 'Your OmniBite subscription is inactive. Please contact support to renew.' }, 403) };
  }
  return { session };
}
