# OmniBite by Avocado Technologies

Digital menu, QR ordering, live kitchen display, bills & PDF receipts and analytics for restaurants, cafes and dhabas.
Next.js 15 · MongoDB (Mongoose) · Cloudinary · Socket.IO · Recharts

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` (include a database name, e.g. `...mongodb.net/omnibite`)
   - `JWT_SECRET` (any long random string)
   - `CLOUDINARY_*` (for dish photo uploads)
3. `npm run seed` (drops and recreates the demo data)
4. `npm run dev` → http://localhost:3000 (use this, not `next dev`; it also runs the live-update server)

Production: `npm run build`, then `npm start`.

## Logins (all at /login)
| Role | Email | Password |
|---|---|---|
| Super admin | admin@omnibite.com | Admin@123 |
| Owner | owner@spicegarden.com | Owner@123 |
| Staff | staff@spice-garden.com | Staff@123 |
| Other owners | owner@brewhouse.com, owner@pizzapalace.com, owner@dragonwok.com, owner@highwaydhaba.com | Owner@123 |
| Expired subscription (login blocked) | owner@oldtown.com | Owner@123 |
| Suspended (login blocked) | owner@moonlightcafe.com | Owner@123 |

## Pages
- Marketing site: `/`
- **Customer landing page: `/{slug}`** (e.g. `/spice-garden`, `/cafe-brew-house`, `/highway-dhaba`), shown to restaurants as a sample of what they get
- Guest QR menu: `/{slug}/menu?table=4`
- Dashboard (opens on Analytics & Reports): `/dashboard`; QR codes at `/dashboard/qr`
- Super admin console: `/admin`

## Super admin: subscriptions
- **Approve** a pending request, **Add customer**, **Renew** or **Reactivate**: choose the plan.
  - *1-month trial*: free, ends exactly one month after the start date.
  - *1-year subscription*: enter the amount received; ends exactly one year after the start date.
  - The start date defaults to today and can be changed; the end date recalculates automatically.
- When a subscription ends, the customer's login, landing page, menu and ordering stop automatically. Press **Reactivate** to start a new plan (or keep the current one if it is still valid after a suspension).
- Each customer has a category: Restaurant, Cafe or Dhaba (editable in the table).
- The dashboard header and the guest menu show the customer's own business name and category.

## Re-theming
Change `--brand*` variables in `app/globals.css` and `BRAND` / `PALETTE` in `lib/theme.js` (charts).
