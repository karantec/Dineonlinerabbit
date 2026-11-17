import { connectDB } from '@/lib/db';
import { RestaurantModel, OrderModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';
import { effectiveStatus, daysLeft } from '@/lib/subscription';
import { slugify, RESERVED, validType, buildSubscription, applySubscription, ensureOwner } from '@/lib/provision';
import { UserModel } from '@/lib/models';

export async function GET() {
  const { error } = await requireAuth(['superadmin']);
  if (error) return error;
  await connectDB();
  const restaurants = await RestaurantModel.find().sort('-createdAt').lean();
  const agg = await OrderModel.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: '$restaurant', gmv: { $sum: '$total' }, orders: { $sum: 1 } } }]);
  const map = Object.fromEntries(agg.map((a) => [String(a._id), a]));
  const list = restaurants.map((r) => ({
    ...r, effective: effectiveStatus(r), daysLeft: daysLeft(r),
    gmv: Math.round(map[String(r._id)]?.gmv || 0), orders: map[String(r._id)]?.orders || 0,
  }));
  return json({
    restaurants: list,
    stats: {
      total: list.length,
      active: list.filter((r) => r.effective === 'active').length,
      pending: list.filter((r) => r.effective === 'pending').length,
      expired: list.filter((r) => r.effective === 'expired').length,
      gmv: list.reduce((s, r) => s + r.gmv, 0),
      orders: list.reduce((s, r) => s + r.orders, 0),
      subscriptionRevenue: restaurants.reduce((s, r) => s + (r.subscriptionHistory || []).reduce((x, h) => x + (h.amount || 0), 0), 0),
    },
  });
}

// Admin adds a customer directly (already approved) with category + plan
export async function POST(req) {
  const { error } = await requireAuth(['superadmin']);
  if (error) return error;
  await connectDB();
  const b = await req.json();
  if (!b.name || !b.email) return json({ error: 'Business name and owner email are required' }, 400);
  const email = String(b.email).toLowerCase();
  if (await UserModel.exists({ email }) || await RestaurantModel.exists({ email })) return json({ error: 'This email is already registered' }, 409);

  const { sub, error: planError } = buildSubscription(b);
  if (planError) return json({ error: planError }, 400);

  let slug = slugify(b.slug || b.name);
  if (!slug || RESERVED.includes(slug)) slug = `${slug || 'restaurant'}-1`;
  for (let i = 2; await RestaurantModel.exists({ slug }); i++) slug = `${slugify(b.slug || b.name)}-${i}`;

  const r = await RestaurantModel.create({
    name: b.name, slug, ownerName: b.ownerName, email, phone: b.phone, address: b.address,
    businessType: validType(b.businessType) || 'restaurant', status: 'pending',
  });
  applySubscription(r, sub);
  await r.save();
  const o = await ensureOwner(r);
  return json({ restaurant: r, emailSent: o.emailSent, tempPassword: o.tempPassword }, 201);
}
