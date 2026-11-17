import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { RestaurantModel, CategoryModel, MenuItemModel } from '@/lib/models';
import { isLive, typeInfo } from '@/lib/subscription';
import RestaurantLanding from '@/components/RestaurantLanding';

export const dynamic = 'force-dynamic';

async function getData(slug) {
  await connectDB();
  const r = await RestaurantModel.findOne({ slug: slug.toLowerCase() }).select('-subscriptionHistory').lean();
  if (!r || !isLive(r)) return null;
  const [cats, items] = await Promise.all([
    CategoryModel.find({ restaurant: r._id }).sort('sort').lean(),
    MenuItemModel.find({ restaurant: r._id, available: true }).sort('sort').lean(),
  ]);
  const { subscription, status, ...rest } = r;
  return JSON.parse(JSON.stringify({ r: rest, cats, items })); // plain, serialisable data
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = await getData(slug);
  if (!d) return { title: 'Not found' };
  return { title: `${d.r.name} · ${typeInfo(d.r.businessType).label}`, description: `${d.r.name}: view the menu and order from your table.` };
}

// Public landing page of each customer, at /{slug}
export default async function RestaurantPage({ params }) {
  const { slug } = await params;
  const d = await getData(slug);
  if (!d) notFound();
  return <RestaurantLanding {...d} />;
}
