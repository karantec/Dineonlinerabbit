import { connectDB } from '@/lib/db';
import { RestaurantModel, CategoryModel, MenuItemModel } from '@/lib/models';
import { json } from '@/lib/auth';
import { isLive } from '@/lib/subscription';

// Public menu for QR guests (only for restaurants that are approved and within their subscription)
export async function GET(_req, { params }) {
  await connectDB();
  const { slug } = await params;
  const r = await RestaurantModel.findOne({ slug: slug.toLowerCase() }).select('name slug logo cuisine businessType address phone taxRate currency tables hours status subscription.endDate').lean();
  if (!r || !isLive(r)) return json({ error: 'Restaurant not found' }, 404);
  const { status, subscription, ...restaurant } = r;
  const [categories, items] = await Promise.all([
    CategoryModel.find({ restaurant: r._id }).sort('sort').lean(),
    MenuItemModel.find({ restaurant: r._id }).sort('sort').lean(),
  ]);
  return json({ restaurant, categories, items });
}
