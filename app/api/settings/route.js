import { connectDB } from '@/lib/db';
import { RestaurantModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';

export async function GET() {
  const { session, error } = await requireAuth(['owner', 'staff']);
  if (error) return error;
  await connectDB();
  return json({ restaurant: await RestaurantModel.findById(session.rid) });
}

export async function PATCH(req) {
  const { session, error } = await requireAuth(['owner']);
  if (error) return error;
  await connectDB();
  const b = await req.json();
  const allowed = ['name', 'phone', 'address', 'logo', 'taxRate', 'currency', 'tables', 'hours'];
  const update = Object.fromEntries(Object.entries(b).filter(([k]) => allowed.includes(k)));
  return json({ restaurant: await RestaurantModel.findByIdAndUpdate(session.rid, update, { new: true }) });
}
