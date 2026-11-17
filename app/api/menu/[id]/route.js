import { connectDB } from '@/lib/db';
import { MenuItemModel, RestaurantModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';
import { emit } from '@/lib/socket';

async function notify(rid, item) {
  const r = await RestaurantModel.findById(rid).select('slug').lean();
  if (r) emit(`menu:${r.slug}`, 'menu:changed', { id: item._id, available: item.available });
}

export async function PATCH(req, { params }) {
  const { session, error } = await requireAuth(['owner', 'staff']);
  if (error) return error;
  await connectDB();
  const { id } = await params;
  let body = await req.json();
  // Staff may only toggle availability
  if (session.role === 'staff') body = { available: !!body.available };
  const { _id, __v, createdAt, updatedAt, restaurant, ...update } = body;
  if (update.category === '') update.category = null;
  const item = await MenuItemModel.findOneAndUpdate({ _id: id, restaurant: session.rid }, update, { new: true });
  if (!item) return json({ error: 'Not found' }, 404);
  await notify(session.rid, item);
  return json({ item });
}

export async function DELETE(_req, { params }) {
  const { session, error } = await requireAuth(['owner']);
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const item = await MenuItemModel.findOneAndDelete({ _id: id, restaurant: session.rid });
  if (item) await notify(session.rid, item);
  return json({ ok: true });
}
