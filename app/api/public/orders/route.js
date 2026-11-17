import { connectDB } from '@/lib/db';
import { RestaurantModel, MenuItemModel, OrderModel } from '@/lib/models';
import { json } from '@/lib/auth';
import { emit } from '@/lib/socket';
import { isLive } from '@/lib/subscription';

// Public: guest places an order. Prices are recomputed server-side from the menu.
export async function POST(req) {
  try {
    await connectDB();
    const { slug, table, customerName, items } = await req.json();
    const r = await RestaurantModel.findOne({ slug: String(slug || '').toLowerCase() }).lean();
    if (!r || !isLive(r)) return json({ error: 'This restaurant is not accepting orders right now' }, 404);
    if (!Array.isArray(items) || !items.length) return json({ error: 'Cart is empty' }, 400);

    const menu = await MenuItemModel.find({ _id: { $in: items.map((i) => i.itemId) }, restaurant: r._id }).lean();
    const byId = new Map(menu.map((m) => [String(m._id), m]));

    const lines = [];
    let subtotal = 0;
    for (const it of items) {
      const m = byId.get(String(it.itemId));
      if (!m) return json({ error: 'An item is no longer on the menu' }, 409);
      if (!m.available) return json({ error: `${m.name} is currently unavailable` }, 409);
      const size = (m.sizes || []).find((s) => s.name === it.size);
      const addons = (it.addons || []).map((n) => (m.addons || []).find((a) => a.name === n)).filter(Boolean);
      const unit = (size ? size.price : m.price) + addons.reduce((s, a) => s + a.price, 0);
      const qty = Math.max(1, Math.min(50, +it.qty || 1));
      subtotal += unit * qty;
      lines.push({ name: m.name, qty, price: unit, size: size?.name, addons: addons.map((a) => a.name), note: String(it.note || '').slice(0, 200) });
    }
    const tax = +(subtotal * ((r.taxRate || 0) / 100)).toFixed(2);
    // Atomic, race-free order number
    const { orderSeq } = await RestaurantModel.findByIdAndUpdate(r._id, { $inc: { orderSeq: 1 } }, { new: true }).select('orderSeq').lean();
    const order = await OrderModel.create({
      restaurant: r._id, number: orderSeq, table: String(table || '-').slice(0, 10),
      customerName: String(customerName || '').slice(0, 60), items: lines, subtotal, tax, total: +(subtotal + tax).toFixed(2),
    });
    emit(`restaurant:${r._id}`, 'order:new', order);
    return json({ order }, 201);
  } catch (e) {
    console.error('place order failed', e);
    return json({ error: 'Could not place order. Please try again.' }, 500);
  }
}

// Public: order tracking by id
export async function GET(req) {
  await connectDB();
  const id = new URL(req.url).searchParams.get('id');
  const order = id && (await OrderModel.findById(id).lean().catch(() => null));
  return order ? json({ order }) : json({ error: 'Not found' }, 404);
}
