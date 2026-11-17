import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';

const TZ = 'Asia/Kolkata';

export async function GET(req) {
  const { session, error } = await requireAuth(['owner', 'staff']);
  if (error) return error;
  await connectDB();
  const days = Math.min(90, Math.max(1, +new URL(req.url).searchParams.get('days') || 14));
  const now = Date.now();
  const since = new Date(now - days * 86400000);
  const prevSince = new Date(now - 2 * days * 86400000);
  const rid = new mongoose.Types.ObjectId(session.rid);
  const live = { restaurant: rid, status: { $ne: 'Cancelled' } };
  const sum = { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } };

  const [daily, top, byStatus, totals, prev, hourly, recent] = await Promise.all([
    OrderModel.aggregate([{ $match: { ...live, createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    OrderModel.aggregate([{ $match: { ...live, createdAt: { $gte: since } } }, { $unwind: '$items' }, { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } } } }, { $sort: { qty: -1 } }, { $limit: 8 }]),
    OrderModel.aggregate([{ $match: { restaurant: rid, createdAt: { $gte: since } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    OrderModel.aggregate([{ $match: { ...live, createdAt: { $gte: since } } }, sum]),
    OrderModel.aggregate([{ $match: { ...live, createdAt: { $gte: prevSince, $lt: since } } }, sum]),
    OrderModel.aggregate([{ $match: { ...live, createdAt: { $gte: since } } }, { $group: { _id: { $hour: { date: '$createdAt', timezone: TZ } }, orders: { $sum: 1 } } }]),
    OrderModel.find({ restaurant: rid }).sort('-createdAt').limit(6).lean(),
  ]);

  const t = totals[0] || { revenue: 0, orders: 0 };
  const p = prev[0] || { revenue: 0, orders: 0 };
  const pct = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null);
  const hmap = Object.fromEntries(hourly.map((h) => [h._id, h.orders]));
  return json({
    days,
    daily: daily.map((d) => ({ date: d._id, revenue: Math.round(d.revenue), orders: d.orders })),
    top: top.map((d) => ({ name: d._id, qty: d.qty, revenue: Math.round(d.revenue) })),
    byStatus: byStatus.map((s) => ({ name: s._id, value: s.count })),
    hourly: Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, orders: hmap[h] || 0 })).slice(8),
    recent,
    revenue: Math.round(t.revenue), orders: t.orders, avgOrder: t.orders ? Math.round(t.revenue / t.orders) : 0,
    revenueDelta: pct(t.revenue, p.revenue), ordersDelta: pct(t.orders, p.orders),
  });
}
