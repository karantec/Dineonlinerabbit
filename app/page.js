import Link from 'next/link';
import Icon from '@/components/Icon';
import Brand from '@/components/Brand';
import QRDecor from '@/components/QRDecor';

export const metadata = { title: 'OmniBite by Avocado Technologies · Digital menu, QR ordering & kitchen display' };

const FEATURES = [
  ['chart', 'Analytics & Reports', 'Revenue trends, peak hours, best sellers and order mix, ready on your dashboard the moment you log in.'],
  ['utensils', 'Digital menu', 'A beautiful QR menu with sizes, add-ons, veg / non-veg tags and kitchen notes. Mark a dish sold out and every guest sees it instantly.'],
  ['bolt', 'Live Kitchen display', 'Orders reach the kitchen the second they are placed, with a chime. Move them across a Kanban board or a compact table.'],
  ['receipt', 'Bills & PDF Receipts', 'Tax is calculated automatically. Download a clean PDF receipt for any order with one click.'],
];

const STEPS = [
  ['Register', 'Sign up your restaurant, cafe or dhaba in a minute.'],
  ['Build your menu', 'Add categories and dishes with photos, sizes and add-ons.'],
  ['Generate QR', 'Create a QR code for every table and print the cards.'],
  ['Get the orders', 'Guests scan and order. Your kitchen sees it live.'],
];

const AUDIENCE = [
  ['🍽️', 'Restaurants', '/spice-garden', ['Table-wise QR ordering', 'Sizes, add-ons and kitchen notes', 'Faster table turnover']],
  ['☕', 'Cafes', '/cafe-brew-house', ['Quick counter and table orders', 'Seasonal menus in seconds', 'Peak-hour insights']],
  ['🍛', "Dhaba's", '/highway-dhaba', ['Simple menu, zero training', 'Handle the rush without chaos', 'Bills and receipts in a tap']],
];

const NUMBERS = [['850+', 'Restaurants, cafes & dhabas'], ['2.4M+', 'Orders served'], ['₹120 Cr+', 'Billed through OmniBite'], ['4.8 / 5', 'Average owner rating']];

export default function Home() {
  return (
    <>
      <header className="l-nav">
        <div className="l-nav-in">
          <Brand />
          <nav className="l-links">
            <a href="#features">Features</a><a href="#how">How it works</a><a href="#who">Who it's for</a><a href="#qr">QR codes</a><a href="#demo">Live demo</a>
          </nav>
          <div className="row" style={{ gap: '.5rem' }}>
            <Link href="/login" className="btn ghost sm">Login</Link>
            <Link href="/register" className="btn light sm">Get started</Link>
          </div>
        </div>
      </header>

      <section className="l-hero">
        <i className="orb o1" /><i className="orb o2" /><i className="orb o3" /><i className="cube" />
        <div className="l-wrap l-hero-grid">
          <div>
            <span className="eyebrow"><Icon name="bolt" size={14} /> Real-time ordering for modern food businesses</span>
            <h1>Scan. Order. <em>Served.</em><br /><span className="accent">Run your restaurant, cafe or dhaba from one place.</span></h1>
            <p className="lead">OmniBite gives every table its own QR code, sends orders straight to your kitchen, and turns your sales into clear reports, all in one platform.</p>
            <div className="row">
              <Link href="/register" className="btn light lg">Register your restaurant <Icon name="arrow" size={18} /></Link>
              <Link href="/spice-garden" className="btn outline lg"><Icon name="store" size={18} /> See a sample landing page</Link>
            </div>
            <div className="l-trust">
              <div><b>850+</b><span>Restaurants & cafes</span></div>
              <div><b>2.4M+</b><span>Orders served</span></div>
              <div><b>99.9%</b><span>Uptime</span></div>
            </div>
          </div>

          <div className="phone-stage">
            <div className="float-card a"><span className="stat-ico" style={{ width: 38, height: 38 }}><Icon name="bell" size={18} /></span><div><b>New order #1042</b><div className="muted">Table 4 · 3 items</div></div></div>
            <div className="phone"><div className="phone-screen">
              <div className="ph-hero">Spice Garden<small>Table 4 · Scan & order</small></div>
              {[['🧀', 'Paneer Tikka', '₹249'], ['🍗', 'Butter Chicken', '₹349'], ['🍛', 'Veg Biryani', '₹269'], ['🫓', 'Garlic Naan', '₹69'], ['🍮', 'Gulab Jamun', '₹99'], ['🍵', 'Masala Chai', '₹59']].map(([e, n, p]) => (
                <div className="ph-item" key={n}><div className="e">{e}</div><div style={{ flex: 1 }}><b>{n}</b><span className="muted">Freshly prepared</span></div><b style={{ color: 'var(--brand)' }}>{p}</b></div>
              ))}
            </div></div>
            <div className="float-card b"><span className="stat-ico" style={{ width: 38, height: 38 }}><Icon name="trending" size={18} /></span><div><b>₹48,250 today</b><div className="muted">+18% vs last week</div></div></div>
          </div>
        </div>
      </section>

      <section className="l-numbers">
        <div className="l-wrap grid cols-4">
          {NUMBERS.map(([n, l]) => <div key={l} className="num"><b>{n}</b><span>{l}</span></div>)}
        </div>
      </section>

      <section id="features" className="l-section alt">
        <div className="l-wrap">
          <div className="l-title"><h2>Features</h2><p>Everything you need from the guest's table to the owner's dashboard.</p></div>
          <div className="grid cols-4">
            {FEATURES.map(([ic, t, d]) => (
              <div className="card feat" key={t}><div className="stat-ico"><Icon name={ic} size={22} /></div><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="l-section">
        <div className="l-wrap">
          <div className="l-title"><h2>How it works</h2><p>From sign-up to your first scanned order in an afternoon.</p></div>
          <div className="how">{STEPS.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>

      <section id="who" className="l-section alt">
        <div className="l-wrap">
          <div className="l-title"><h2>Who it's for</h2><p>Built for every kind of food business. Tap a card to see a sample landing page.</p></div>
          <div className="grid cols-3">
            {AUDIENCE.map(([e, t, href, li]) => (
              <Link href={href} key={t} className="card feat aud">
                <div className="aud-emoji">{e}</div><h3>{t}</h3>
                <ul>{li.map((x) => <li key={x}>{x}</li>)}</ul>
                <span className="aud-link">View sample page <Icon name="arrow" size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="qr" className="l-section">
        <div className="l-wrap">
          <div className="l-qr">
            <div>
              <span className="eyebrow"><Icon name="qr" size={14} /> QR Studio</span>
              <h2 style={{ marginTop: '1rem' }}>Where do I generate my QR codes?</h2>
              <p style={{ opacity: .9 }}>Right inside your dashboard. Pick a table range, choose a colour, then download each QR as a PNG or print them all as ready-to-place table cards.</p>
              <div className="path"><span>Login</span><Icon name="arrow" size={15} /><span>Dashboard</span><Icon name="arrow" size={15} /><span>QR Codes</span></div>
              <div className="row">
                <Link href="/dashboard/qr" className="btn light lg"><Icon name="qr" size={18} /> Open QR Studio</Link>
                <Link href="/login" className="btn outline-light lg">Login first</Link>
              </div>
            </div>
            <div className="qr-demo">
              <div className="h">Spice Garden</div>
              <QRDecor size={210} />
              <h2 style={{ margin: '.4rem 0 0' }}>Table 4</h2>
              <div className="muted">Scan to view menu & order</div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="l-section alt">
        <div className="l-wrap">
          <div className="l-title"><h2>See how your own page will look</h2><p>Every customer gets a branded landing page and a QR menu. Open the samples below.</p></div>
          <div className="grid cols-2">
            <div className="card">
              <h3>Sample landing pages & menus</h3>
              <div className="grid" style={{ gap: '.6rem', marginTop: '.6rem' }}>
                {[['/spice-garden', '🍽️ Spice Garden', 'Restaurant'], ['/cafe-brew-house', '☕ Cafe Brew House', 'Cafe'], ['/highway-dhaba', '🍛 Highway Dhaba', 'Dhaba']].map(([h, n, c]) => (
                  <Link key={h} href={h} className="btn ghost" style={{ justifyContent: 'space-between' }}><span><b>{n}</b> <span className="muted">· {c} landing page</span></span><Icon name="arrow" size={16} /></Link>
                ))}
                <Link href="/spice-garden/menu?table=4" className="btn outline" style={{ justifyContent: 'space-between' }}><span><Icon name="phone" size={16} /> Guest menu (table 4)</span><Icon name="arrow" size={16} /></Link>
              </div>
            </div>
            <div className="card" style={{ overflowX: 'auto' }}>
              <h3>Demo logins</h3>
              <table className="demo-table"><thead><tr><th>Role</th><th>Email</th><th>Password</th></tr></thead><tbody>
                <tr><td>Super admin</td><td><code>admin@omnibite.com</code></td><td><code>Admin@123</code></td></tr>
                <tr><td>Owner</td><td><code>owner@spicegarden.com</code></td><td><code>Owner@123</code></td></tr>
                <tr><td>Staff</td><td><code>staff@spice-garden.com</code></td><td><code>Staff@123</code></td></tr>
              </tbody></table>
              <Link href="/login" className="btn" style={{ marginTop: '1rem' }}>Go to login <Icon name="arrow" size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="l-cta">
        <div className="l-wrap">
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#fff' }}>Ready to put your menu on every table?</h2>
          <p className="muted" style={{ fontSize: '1.05rem' }}>Register your restaurant, cafe or dhaba and start taking QR orders today.</p>
          <Link href="/register" className="btn light lg">Register your restaurant <Icon name="arrow" size={18} /></Link>
        </div>
      </section>

      <footer className="l-foot"><div className="l-wrap row spread"><span>© {new Date().getFullYear()} OmniBite by Avocado Technologies. All rights reserved.</span><span className="row" style={{ gap: '1.2rem' }}><Link href="/login">Login</Link><Link href="/register">Register</Link></span></div></footer>
    </>
  );
}
