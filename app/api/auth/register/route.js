import { connectDB } from '@/lib/db';
import { RestaurantModel, UserModel } from '@/lib/models';
import { json } from '@/lib/auth';
import { slugify, RESERVED, validType } from '@/lib/provision';

// Public: restaurant registration request (reviewed by the super admin)
export async function POST(req) {
  await connectDB();
  const { name, slug, ownerName, email, phone, address, businessType } = await req.json();
  if (!name || !email) return json({ error: 'Business name and email are required' }, 400);
  const s = slugify(slug || name);
  if (!s || RESERVED.includes(s)) return json({ error: 'That URL slug is reserved. Please choose another.' }, 400);
  if (await RestaurantModel.exists({ slug: s })) return json({ error: 'That URL slug is taken' }, 409);
  if (await UserModel.exists({ email: String(email).toLowerCase() }) || await RestaurantModel.exists({ email: String(email).toLowerCase() })) return json({ error: 'This email is already registered' }, 409);
  await RestaurantModel.create({ name, slug: s, ownerName, email: String(email).toLowerCase(), phone, address, businessType: validType(businessType) || 'restaurant', status: 'pending' });
  return json({ ok: true });
}
