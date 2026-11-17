import { connectDB } from '@/lib/db';
import { CategoryModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';

export async function GET() {
  const { session, error } = await requireAuth(['owner', 'staff']);
  if (error) return error;
  await connectDB();
  return json({ categories: await CategoryModel.find({ restaurant: session.rid }).sort('sort') });
}

export async function POST(req) {
  const { session, error } = await requireAuth(['owner']);
  if (error) return error;
  await connectDB();
  const { name, sort } = await req.json();
  if (!name) return json({ error: 'Name required' }, 400);
  return json({ category: await CategoryModel.create({ name, sort: sort || 0, restaurant: session.rid }) }, 201);
}
