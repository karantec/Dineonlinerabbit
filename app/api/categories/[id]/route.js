import { connectDB } from '@/lib/db';
import { CategoryModel, MenuItemModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const { session, error } = await requireAuth(['owner']);
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const { name, sort } = await req.json();
  const category = await CategoryModel.findOneAndUpdate({ _id: id, restaurant: session.rid }, { name, sort }, { new: true });
  return category ? json({ category }) : json({ error: 'Not found' }, 404);
}

export async function DELETE(_req, { params }) {
  const { session, error } = await requireAuth(['owner']);
  if (error) return error;
  await connectDB();
  const { id } = await params;
  if (await MenuItemModel.exists({ category: id, restaurant: session.rid })) return json({ error: 'Category still has dishes' }, 409);
  await CategoryModel.deleteOne({ _id: id, restaurant: session.rid });
  return json({ ok: true });
}
