import { connectDB } from '@/lib/db';
import { OrderModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';

export async function GET(req) {
  const { session, error } = await requireAuth(['owner', 'staff']);
  if (error) return error;
  await connectDB();
  const status = new URL(req.url).searchParams.get('status');
  const q = { restaurant: session.rid, ...(status ? { status } : {}) };
  return json({ orders: await OrderModel.find(q).sort('-createdAt').limit(200).lean() });
}
