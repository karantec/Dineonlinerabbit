import mongoose from 'mongoose';
const { Schema, models, model } = mongoose;

const Restaurant = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  ownerName: String,
  email: { type: String, required: true },
  phone: String,
  address: String,
  logo: String,
  cuisine: String,
  businessType: { type: String, enum: ['restaurant', 'cafe', 'dhaba'], default: 'restaurant' },
  subscription: { plan: { type: String, enum: ['trial', 'yearly'] }, amount: { type: Number, default: 0 }, startDate: Date, endDate: Date },
  subscriptionHistory: [{ _id: false, plan: String, amount: Number, startDate: Date, endDate: Date, at: Date }],
  status: { type: String, enum: ['pending', 'active', 'suspended', 'rejected'], default: 'pending' },
  statusReason: String,
  taxRate: { type: Number, default: 5 },
  currency: { type: String, default: '₹' },
  tables: { type: Number, default: 10 },
  orderSeq: { type: Number, default: 1000 }, // atomic per-restaurant order counter
  hours: { open: { type: String, default: '10:00' }, close: { type: String, default: '23:00' } },
}, { timestamps: true });

const User = new Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'owner', 'staff'], default: 'owner' },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
}, { timestamps: true });

const Category = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', index: true },
  name: { type: String, required: true },
  sort: { type: Number, default: 0 },
});

const MenuItem = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  emoji: String, // shown when no image is uploaded
  veg: { type: Boolean, default: true },
  tags: [String],
  available: { type: Boolean, default: true },
  sizes: [{ _id: false, name: String, price: Number }],
  addons: [{ _id: false, name: String, price: Number }],
  sort: { type: Number, default: 0 },
}, { timestamps: true });
MenuItem.index({ restaurant: 1, sort: 1 });

const Order = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  number: Number,
  table: String,
  customerName: String,
  items: [{ _id: false, name: String, qty: Number, price: Number, size: String, addons: [String], note: String }],
  subtotal: Number,
  tax: Number,
  total: Number,
  status: { type: String, enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });
Order.index({ restaurant: 1, createdAt: -1 });

export const RestaurantModel = models.Restaurant || model('Restaurant', Restaurant);
export const UserModel = models.User || model('User', User);
export const CategoryModel = models.Category || model('Category', Category);
export const MenuItemModel = models.MenuItem || model('MenuItem', MenuItem);
export const OrderModel = models.Order || model('Order', Order);
