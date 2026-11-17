import { connectDB } from '@/lib/db';
import { MenuItemModel, CategoryModel, RestaurantModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';
import { emit } from '@/lib/socket';

const clean = (b) => {
  const { _id, __v, createdAt, updatedAt, restaurant, ...rest } = b;
  return rest;
};

export async function GET() {
  const { session, error } = await requireAuth(['owner', 'staff']);
  if (error) return error;
  await connectDB();
  return json({ items: await MenuItemModel.find({ restaurant: session.rid }).populate('category', 'name').sort('sort').lean() });
}

export async function POST(req) {
  const { session, error } = await requireAuth(['owner']);
  if (error) return error;
  await connectDB();
  const body = clean(await req.json());
  if (body.category && !(await CategoryModel.exists({ _id: body.category, restaurant: session.rid }))) return json({ error: 'Bad category' }, 400);
  const item = await MenuItemModel.create({ ...body, restaurant: session.rid });
  const r = await RestaurantModel.findById(session.rid).select('slug').lean();
  emit(`menu:${r.slug}`, 'menu:changed', { id: item._id });
  return json({ item }, 201);
}
