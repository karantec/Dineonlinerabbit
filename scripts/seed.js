// Run: npm run seed   (needs MONGODB_URI in .env.local).
// WARNING: drops and recreates the restaurants, users, categories, menuitems and orders collections.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { RestaurantModel, UserModel, CategoryModel, MenuItemModel, OrderModel } from '../lib/models.js';
import { computeEnd } from '../lib/subscription.js';

if (!process.env.MONGODB_URI) { console.error('MONGODB_URI is missing. Create .env.local from .env.example'); process.exit(1); }
await mongoose.connect(process.env.MONGODB_URI);
console.log(`Seeding database "${mongoose.connection.name}"...`);

// Drop (not just empty) so stale indexes from older versions of the project can't break seeding.
for (const m of [RestaurantModel, UserModel, CategoryModel, MenuItemModel, OrderModel]) {
  try { await m.collection.drop(); } catch (e) { if (e.codeName !== 'NamespaceNotFound') throw e; }
  await m.syncIndexes();
}

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wpick = (arr, w) => { let t = Math.random() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < arr.length; i++) if ((t -= w[i]) < 0) return arr[i]; return arr[arr.length - 1]; };
const D = (name, price, emoji, veg, description, o = {}) => ({ name, price, emoji, veg, description, ...o });
const BEST = { tags: ['Bestseller'] };
const SPICY = { tags: ['Spicy'] };

const NAMES = ['Aman', 'Riya', 'Karan', 'Sneha', 'Vikram', 'Priya', 'Rohit', 'Ananya', 'Arjun', 'Meera', 'Sahil', 'Isha', 'Kabir', 'Diya', 'Nikhil', 'Tanvi', 'Yash', 'Pooja', ''];
const NOTES = ['Less spicy', 'No onion', 'Extra crispy', 'Jain preparation', 'Serve hot', 'Extra napkins', 'Sauce on the side'];

// ---------------- Menus ----------------
const MENUS = {
  'spice-garden': {
    Starters: [
      D('Paneer Tikka', 249, '🧀', true, 'Char-grilled cottage cheese marinated in spices, with mint chutney', { ...BEST, sizes: [{ name: 'Half', price: 149 }, { name: 'Full', price: 249 }] }),
      D('Hara Bhara Kebab', 199, '🥬', true, 'Spinach and green pea patties, pan-seared'),
      D('Chicken 65', 289, '🍗', false, 'Crispy fried chicken bites tossed with curry leaves', SPICY),
      D('Tandoori Chicken', 349, '🍖', false, 'Whole leg marinated overnight, cooked in the tandoor', { sizes: [{ name: 'Half', price: 199 }, { name: 'Full', price: 349 }] }),
      D('Veg Spring Rolls', 189, '🥟', true, 'Crunchy rolls with sweet chilli dip'),
      D('Fish Amritsari', 329, '🐟', false, 'Gram-flour battered fish, ajwain and lemon'),
    ],
    'Main Course': [
      D('Butter Chicken', 349, '🍛', false, 'Creamy tomato gravy with tandoori chicken', { ...BEST, addons: [{ name: 'Extra Butter', price: 20 }, { name: 'Extra Gravy', price: 40 }] }),
      D('Paneer Butter Masala', 299, '🍲', true, 'Soft paneer cubes in rich makhani gravy', BEST),
      D('Dal Makhani', 249, '🥘', true, 'Black lentils slow-cooked overnight with cream'),
      D('Kadhai Paneer', 289, '🫕', true, 'Paneer with capsicum and freshly ground kadhai masala'),
      D('Mutton Rogan Josh', 429, '🍖', false, 'Kashmiri-style mutton curry', SPICY),
      D('Palak Paneer', 279, '🥗', true, 'Paneer in smooth spinach gravy'),
    ],
    Biryani: [
      D('Veg Biryani', 269, '🍚', true, 'Fragrant basmati with vegetables, served with raita', { addons: [{ name: 'Extra Raita', price: 30 }] }),
      D('Chicken Biryani', 329, '🍛', false, 'Dum-cooked biryani with tender chicken', { ...BEST, addons: [{ name: 'Extra Egg', price: 25 }], available: false }),
      D('Mutton Biryani', 429, '🍛', false, 'Slow-cooked with aromatic whole spices'),
    ],
    Breads: [
      D('Butter Naan', 49, '🫓', true, 'Soft tandoor bread brushed with butter'),
      D('Garlic Naan', 69, '🧄', true, 'Naan topped with garlic and coriander', BEST),
      D('Tandoori Roti', 29, '🫓', true, 'Whole wheat, baked in the tandoor'),
      D('Laccha Paratha', 59, '🥞', true, 'Flaky layered paratha'),
    ],
    Desserts: [
      D('Gulab Jamun', 99, '🍮', true, 'Two warm milk dumplings in cardamom syrup', BEST),
      D('Rasmalai', 129, '🍥', true, 'Soft cheese patties in saffron milk'),
      D('Chocolate Brownie', 179, '🍫', true, 'Warm brownie with vanilla ice cream'),
    ],
    Beverages: [
      D('Masala Chai', 59, '🍵', true, 'Spiced Indian tea', { sizes: [{ name: 'Cup', price: 59 }, { name: 'Pot', price: 149 }] }),
      D('Sweet Lassi', 99, '🥛', true, 'Thick, chilled and topped with malai'),
      D('Fresh Lime Soda', 79, '🍋', true, 'Sweet, salted or mixed'),
      D('Mango Shake', 139, '🥭', true, 'Made with Alphonso pulp'),
    ],
  },
  'cafe-brew-house': {
    Coffee: [
      D('Espresso', 110, '☕', true, 'Double shot, rich crema'),
      D('Cappuccino', 160, '☕', true, 'Espresso with steamed milk foam', { ...BEST, sizes: [{ name: 'Regular', price: 160 }, { name: 'Large', price: 200 }], addons: [{ name: 'Extra Shot', price: 40 }, { name: 'Oat Milk', price: 50 }] }),
      D('Caffe Latte', 170, '🥛', true, 'Silky milk, mild espresso', { sizes: [{ name: 'Regular', price: 170 }, { name: 'Large', price: 210 }] }),
      D('Cold Coffee', 180, '🧋', true, 'Blended with vanilla ice cream', BEST),
      D('Hazelnut Mocha', 210, '🍫', true, 'Chocolate, hazelnut and espresso'),
    ],
    'Tea & Coolers': [
      D('Iced Lemon Tea', 140, '🍹', true, 'Black tea, lemon and mint'),
      D('Peach Iced Tea', 150, '🍑', true, 'Light, fruity and refreshing'),
      D('Virgin Mojito', 170, '🍃', true, 'Muddled mint, lime and soda'),
    ],
    Snacks: [
      D('Veg Club Sandwich', 199, '🥪', true, 'Triple-layer toasted sandwich'),
      D('Chicken Tikka Panini', 249, '🥙', false, 'Grilled panini with tikka and cheese'),
      D('Peri Peri Fries', 149, '🍟', true, 'Crispy fries with peri-peri seasoning', { ...BEST, addons: [{ name: 'Cheese Dip', price: 30 }] }),
      D('Nachos Supreme', 219, '🌮', true, 'Loaded with salsa, cheese and jalapeños'),
    ],
    Bakery: [
      D('Blueberry Cheesecake', 220, '🍰', true, 'Baked New York style slice'),
      D('Choco Lava Cake', 160, '🧁', true, 'Molten centre, served warm', BEST),
      D('Butter Croissant', 110, '🥐', true, 'Flaky, baked fresh every morning'),
      D('Banana Walnut Muffin', 99, '🧁', true, 'Moist and lightly spiced'),
    ],
  },
  'pizza-palace': {
    Pizzas: [
      D('Margherita', 249, '🍕', true, 'Tomato, mozzarella and fresh basil', { ...BEST, sizes: [{ name: 'Small', price: 249 }, { name: 'Medium', price: 369 }, { name: 'Large', price: 489 }], addons: [{ name: 'Extra Cheese', price: 60 }, { name: 'Olives', price: 40 }] }),
      D('Farmhouse', 329, '🍕', true, 'Capsicum, onion, mushroom and sweet corn', { sizes: [{ name: 'Small', price: 329 }, { name: 'Medium', price: 469 }, { name: 'Large', price: 599 }], addons: [{ name: 'Extra Cheese', price: 60 }] }),
      D('Pepperoni Feast', 399, '🍕', false, 'Double pepperoni and mozzarella', { ...BEST, sizes: [{ name: 'Small', price: 399 }, { name: 'Medium', price: 539 }, { name: 'Large', price: 679 }] }),
      D('BBQ Chicken', 379, '🍕', false, 'Smoky BBQ sauce, grilled chicken and onions', { sizes: [{ name: 'Small', price: 379 }, { name: 'Medium', price: 519 }, { name: 'Large', price: 649 }] }),
      D('Paneer Makhani Pizza', 349, '🍕', true, 'Indian-style makhani base with paneer', { sizes: [{ name: 'Small', price: 349 }, { name: 'Medium', price: 489 }, { name: 'Large', price: 619 }] }),
    ],
    Pasta: [
      D('Penne Arrabbiata', 269, '🍝', true, 'Spicy tomato sauce, garlic and chilli', SPICY),
      D('Alfredo Pasta', 289, '🍝', true, 'Creamy white sauce with parmesan', BEST),
      D('Chicken Lasagna', 349, '🥘', false, 'Layers of pasta, chicken ragu and cheese'),
    ],
    Sides: [
      D('Garlic Bread', 129, '🥖', true, 'Toasted with garlic butter', { addons: [{ name: 'Cheese Topping', price: 40 }] }),
      D('Stuffed Garlic Bread', 179, '🥖', true, 'Filled with corn and cheese'),
      D('Caesar Salad', 199, '🥗', true, 'Romaine, croutons and parmesan'),
      D('Chicken Wings', 259, '🍗', false, 'Six pieces, buffalo or BBQ', SPICY),
    ],
    Desserts: [
      D('Tiramisu', 189, '🍮', true, 'Classic coffee-soaked layers'),
      D('Choco Lava', 129, '🧁', true, 'Warm chocolate cake'),
    ],
    Drinks: [
      D('Coke', 60, '🥤', true, '300 ml'),
      D('Italian Soda', 110, '🍹', true, 'Blue curacao, lemon or strawberry'),
      D('Cold Coffee', 150, '🧋', true, 'Thick and creamy'),
    ],
  },
  'highway-dhaba': {
    Tandoori: [
      D('Tandoori Roti Basket', 99, '🫓', true, 'Six hot rotis straight from the tandoor'),
      D('Paneer Tikka', 229, '🧀', true, 'Smoky, soft and masala-rubbed', BEST),
      D('Tandoori Chicken', 329, '🍗', false, 'Half chicken, charred to perfection', { ...BEST, sizes: [{ name: 'Half', price: 189 }, { name: 'Full', price: 329 }] }),
      D('Seekh Kebab', 279, '🍢', false, 'Minced mutton, hand-rolled on skewers'),
    ],
    'Dal & Sabzi': [
      D('Dal Tadka', 159, '🥘', true, 'Yellow dal with a smoky garlic tadka', BEST),
      D('Dhaba Style Dal Makhani', 199, '🍲', true, 'Slow-cooked overnight on a wood fire'),
      D('Aloo Gobi', 169, '🥔', true, 'Dry masala, home-style'),
      D('Chicken Curry', 289, '🍛', false, 'Rustic gravy, bone-in chicken', SPICY),
      D('Egg Bhurji', 149, '🍳', false, 'Spiced scrambled eggs with onion and tomato'),
    ],
    'Rotis & Rice': [
      D('Butter Roti', 25, '🫓', true, 'Soft and fresh'),
      D('Makki di Roti', 45, '🌽', true, 'Corn flatbread, served with white butter'),
      D('Aloo Paratha', 79, '🥞', true, 'Stuffed paratha with curd and pickle', { ...BEST, addons: [{ name: 'Extra Butter', price: 15 }] }),
      D('Jeera Rice', 119, '🍚', true, 'Basmati tempered with cumin'),
    ],
    'Chai & Sweets': [
      D('Kulhad Chai', 29, '🍵', true, 'Cutting chai in a clay cup', BEST),
      D('Lassi (Glass)', 89, '🥛', true, 'Thick Punjabi lassi', { sizes: [{ name: 'Glass', price: 89 }, { name: 'Jug', price: 249 }] }),
      D('Gajar Halwa', 119, '🥕', true, 'Warm carrot halwa with dry fruits'),
    ],
  },
  'dragon-wok': {
    Soups: [
      D('Veg Manchow Soup', 129, '🍜', true, 'Spicy, topped with crispy noodles'),
      D('Hot & Sour Chicken Soup', 149, '🍲', false, 'Peppery and tangy'),
    ],
    Starters: [
      D('Chilli Paneer', 249, '🌶️', true, 'Crispy paneer tossed in soy-chilli sauce', { ...BEST, ...SPICY }),
      D('Veg Manchurian', 219, '🥘', true, 'Fried veg dumplings in garlic gravy', { addons: [{ name: 'Extra Gravy', price: 30 }] }),
      D('Chicken Lollipop', 289, '🍗', false, 'Frenched drumsticks with schezwan dip', BEST),
      D('Honey Chilli Potato', 189, '🥔', true, 'Crispy potatoes in a sweet-spicy glaze'),
    ],
    Noodles: [
      D('Hakka Noodles', 199, '🍜', true, 'Wok-tossed with vegetables', { sizes: [{ name: 'Half', price: 139 }, { name: 'Full', price: 199 }], addons: [{ name: 'Add Egg', price: 25 }] }),
      D('Schezwan Noodles', 219, '🍜', true, 'Fiery schezwan sauce', { ...SPICY, sizes: [{ name: 'Half', price: 149 }, { name: 'Full', price: 219 }] }),
      D('Chicken Chowmein', 249, '🍝', false, 'Classic street-style chowmein', BEST),
    ],
    Rice: [
      D('Veg Fried Rice', 189, '🍚', true, 'Long-grain rice with fresh vegetables'),
      D('Chicken Fried Rice', 229, '🍚', false, 'Egg, chicken and spring onions'),
      D('Burnt Garlic Rice', 209, '🧄', true, 'Smoky garlic and soy'),
    ],
    Sweets: [
      D('Honey Noodles with Ice Cream', 169, '🍨', true, 'Crispy noodles, honey, vanilla ice cream'),
      D('Date Pancake', 149, '🥞', true, 'Crisp pancake filled with dates'),
    ],
  },
};

// ---------------- Helpers ----------------
const hash = (p) => bcrypt.hash(p, 10);
const IST = 330 * 60000;
const todayStart = Math.floor((Date.now() + IST) / 864e5) * 864e5 - IST; // IST midnight in UTC ms
const nowMin = Math.floor((Date.now() - todayStart) / 60000);
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const PROFILES = {
  meal: [1, 2, 6, 9, 7, 3, 2, 2, 3, 7, 10, 9, 5, 2],
  cafe: [3, 6, 5, 4, 3, 4, 7, 8, 7, 5, 4, 3, 2, 1],
};

async function makeRestaurant({ name, slug, owner, email, cuisine, phone, address, status = 'active', perDay = [18, 34], profile = 'meal', reason, businessType = 'restaurant', plan, amount = 0, startAgoDays = 0 }) {
  let subscription, subscriptionHistory;
  if (plan) {
    const d0 = new Date(Date.now() + IST - startAgoDays * 864e5);
    const startDate = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), d0.getUTCDate()));
    subscription = { plan, amount, startDate, endDate: computeEnd(startDate, plan) };
    subscriptionHistory = [{ ...subscription, at: startDate }];
  }
  const r = await RestaurantModel.create({ name, slug, ownerName: owner, email, cuisine, phone, address, status, statusReason: reason, tables: 12, taxRate: 5, businessType, subscription, subscriptionHistory });
  if (status === 'pending') return r;

  await UserModel.create({ name: owner, email, password: await hash('Owner@123'), role: 'owner', restaurant: r._id });
  if (status !== 'active' || !MENUS[slug]) return r;
  await UserModel.create({ name: 'Kitchen Staff', email: `staff@${slug}.com`, password: await hash('Staff@123'), role: 'staff', restaurant: r._id });

  // categories + dishes
  const items = [];
  let ci = 0;
  for (const [cat, dishes] of Object.entries(MENUS[slug])) {
    const c = await CategoryModel.create({ restaurant: r._id, name: cat, sort: ci++ });
    const docs = await MenuItemModel.insertMany(dishes.map((d, i) => ({ restaurant: r._id, category: c._id, sort: i, available: true, ...d })));
    items.push(...docs.map((x) => x.toObject()));
  }
  const sellable = items.filter((i) => i.available);
  const weights = sellable.map((i) => (i.tags?.includes('Bestseller') ? 5 : 1));

  const makeOrder = (createdAt, status) => {
    const lines = [];
    for (let n = rnd(1, 4); n > 0; n--) {
      const it = wpick(sellable, weights);
      const size = it.sizes?.length ? pick(it.sizes) : null;
      const adds = it.addons?.length && Math.random() < 0.3 ? [pick(it.addons)] : [];
      const price = (size ? size.price : it.price) + adds.reduce((s, a) => s + a.price, 0);
      lines.push({ name: it.name, qty: wpick([1, 2, 3], [7, 3, 1]), price, ...(size && { size: size.name }), addons: adds.map((a) => a.name), ...(Math.random() < 0.12 && { note: pick(NOTES) }) });
    }
    const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
    const tax = +(subtotal * 0.05).toFixed(2);
    return { restaurant: r._id, table: String(rnd(1, 12)), customerName: pick(NAMES), items: lines, subtotal, tax, total: +(subtotal + tax).toFixed(2), status, createdAt, updatedAt: createdAt };
  };

  const DAYS = 45;
  const orders = [];
  for (let d = DAYS - 1; d >= 0; d--) {
    const dayStart = todayStart - d * 864e5;
    const dow = new Date(dayStart + IST).getUTCDay();
    const boost = [1.35, 0.85, 0.85, 0.9, 1, 1.25, 1.45][dow]; // Sun..Sat
    const trend = 0.8 + 0.4 * ((DAYS - d) / DAYS); // gently growing
    let count = Math.round(rnd(...perDay) * boost * trend);
    if (d === 0) count = Math.round(count * Math.min(1, nowMin / 1200));
    for (let i = 0; i < count; i++) {
      const hour = wpick(HOURS, PROFILES[profile]);
      let min = hour * 60 + rnd(0, 59);
      if (d === 0 && min > nowMin - 30) continue; // keep today's history in the past; live orders added below
      orders.push(makeOrder(new Date(dayStart + min * 60000), Math.random() < 0.06 ? 'Cancelled' : 'Completed'));
    }
  }
  // Live orders so the Kitchen Display isn't empty
  [['Pending', 2], ['Pending', 5], ['Accepted', 9], ['Preparing', 14], ['Preparing', 19], ['Ready', 24]].forEach(([st, ago]) => orders.push(makeOrder(new Date(Date.now() - ago * 60000), st)));

  orders.sort((a, b) => a.createdAt - b.createdAt).forEach((o, i) => { o.number = 1001 + i; });
  await OrderModel.collection.insertMany(orders);
  await RestaurantModel.updateOne({ _id: r._id }, { orderSeq: 1000 + orders.length });
  console.log(`  ✓ ${name}: ${items.length} dishes, ${orders.length} orders`);
  return r;
}

// ---------------- Data ----------------
await UserModel.create({ name: 'Super Admin', email: 'admin@omnibite.com', password: await hash('Admin@123'), role: 'superadmin' });

await makeRestaurant({ name: 'Spice Garden', slug: 'spice-garden', owner: 'Rahul Sharma', email: 'owner@spicegarden.com', cuisine: 'North Indian', phone: '+91 98765 43210', address: 'Main Road, Ranchi, Jharkhand', perDay: [26, 44], businessType: 'restaurant', plan: 'yearly', amount: 24000, startAgoDays: 165 });
await makeRestaurant({ name: 'Cafe Brew House', slug: 'cafe-brew-house', owner: 'Neha Verma', email: 'owner@brewhouse.com', cuisine: 'Coffee & Bakery', phone: '+91 98111 22334', address: 'Sector 5, Bokaro', profile: 'cafe', perDay: [20, 36], businessType: 'cafe', plan: 'yearly', amount: 18000, startAgoDays: 120 });
await makeRestaurant({ name: 'Pizza Palace', slug: 'pizza-palace', owner: "Marco D'Souza", email: 'owner@pizzapalace.com', cuisine: 'Italian', phone: '+91 99001 77889', address: 'Lalpur Chowk, Ranchi', perDay: [16, 30], businessType: 'restaurant', plan: 'trial', startAgoDays: 6 });
await makeRestaurant({ name: 'Dragon Wok', slug: 'dragon-wok', owner: 'Li Wei Chen', email: 'owner@dragonwok.com', cuisine: 'Indo-Chinese', phone: '+91 97000 55661', address: 'Station Road, Jamshedpur', perDay: [14, 26], businessType: 'restaurant', plan: 'yearly', amount: 15000, startAgoDays: 360 }); // ends in ~5 days: shows the renewal warning
await makeRestaurant({ name: 'Highway Dhaba', slug: 'highway-dhaba', owner: 'Gurmeet Singh', email: 'owner@highwaydhaba.com', cuisine: 'Punjabi', phone: '+91 98888 12345', address: 'NH-33, Ranchi Highway', perDay: [22, 38], businessType: 'dhaba', plan: 'trial', startAgoDays: 2 });

// Pending sign-ups to approve in /admin
await makeRestaurant({ name: 'Green Bowl Kitchen', slug: 'green-bowl-kitchen', owner: 'Amit Singh', email: 'amit@greenbowl.com', cuisine: 'Healthy bowls', phone: '+91 90000 11122', address: 'Kanke Road, Ranchi', status: 'pending', businessType: 'restaurant' });
await makeRestaurant({ name: 'Tandoor Express', slug: 'tandoor-express', owner: 'Pooja Das', email: 'pooja@tandoorexpress.com', cuisine: 'Tandoori', phone: '+91 90000 33344', address: 'Hinoo, Ranchi', status: 'pending', businessType: 'dhaba' });
await makeRestaurant({ name: 'Sweet Tooth Bakery', slug: 'sweet-tooth-bakery', owner: 'Farah Khan', email: 'farah@sweettooth.com', cuisine: 'Bakery', phone: '+91 90000 55566', address: 'Doranda, Ranchi', status: 'pending', businessType: 'cafe' });

// Expired subscription (demo of the Reactivate button) and a suspended customer
await makeRestaurant({ name: 'Old Town Diner', slug: 'old-town-diner', owner: 'Sam Thomas', email: 'owner@oldtown.com', cuisine: 'American', phone: '+91 90000 77788', address: 'Circular Road, Ranchi', businessType: 'restaurant', plan: 'yearly', amount: 12000, startAgoDays: 400 });
await makeRestaurant({ name: 'Moonlight Cafe', slug: 'moonlight-cafe', owner: 'Zoya Ali', email: 'owner@moonlightcafe.com', cuisine: 'Cafe', phone: '+91 90000 99900', address: 'Morabadi, Ranchi', status: 'suspended', reason: 'Payment dispute', businessType: 'cafe', plan: 'yearly', amount: 18000, startAgoDays: 90 });

console.log(`
Seeded. Logins (all on /login):
  Super admin  admin@omnibite.com          Admin@123
  Owner        owner@spicegarden.com       Owner@123   (also owner@brewhouse.com, owner@pizzapalace.com, owner@dragonwok.com, owner@highwaydhaba.com)
  Staff        staff@spice-garden.com      Staff@123   (also staff@cafe-brew-house.com, staff@pizza-palace.com, staff@dragon-wok.com, staff@highway-dhaba.com)
  Expired      owner@oldtown.com           Owner@123   (login blocked: subscription expired. Use Reactivate in /admin)
  Suspended    owner@moonlightcafe.com     Owner@123   (login blocked: suspended)
Landing pages: /spice-garden  /cafe-brew-house  /pizza-palace  /dragon-wok  /highway-dhaba
Guest menus:   /spice-garden/menu?table=4  /cafe-brew-house/menu?table=2  /highway-dhaba/menu?table=3
Pending requests to approve in /admin: Green Bowl Kitchen, Tandoor Express, Sweet Tooth Bakery`);
await mongoose.disconnect();
