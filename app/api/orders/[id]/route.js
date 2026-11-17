import { connectDB } from '@/lib/db';
import { OrderModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';
import { emit } from '@/lib/socket';

const STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export async function PATCH(req, { params }) {
  const { session, error } = await requireAuth(['owner', 'staff']);
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const { status } = await req.json();
  if (!STATUSES.includes(status)) return json({ error: 'Invalid status' }, 400);
  const order = await OrderModel.findOneAndUpdate({ _id: id, restaurant: session.rid }, { status }, { new: true });
  if (!order) return json({ error: 'Not found' }, 404);
  emit(`restaurant:${session.rid}`, 'order:update', order);
  emit(`order:${order._id}`, 'order:update', order);
  return json({ order });
}
