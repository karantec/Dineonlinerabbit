import Link from 'next/link';
import Icon from '@/components/Icon';
import QRDecor from '@/components/QRDecor';
import { typeInfo } from '@/lib/subscription';

const to12h = (t) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };

/** The public, branded page each customer gets at /{slug}. Pure component, receives plain data. */
export default function RestaurantLanding({ r, cats, items }) {
  const t = typeInfo(r.businessType);
  const cur = r.currency || '₹';
  const menuHref = `/${r.slug}/menu`;
  const best = items.filter((i) => i.tags?.includes('Bestseller'));
  const popular = (best.length >= 3 ? best : [...best, ...items.filter((i) => !best.includes(i))]).slice(0, 6);
  const catCards = cats.map((c) => ({ ...c, list: items.filter((i) => i.category === c._id) })).filter((c) => c.list.length);
  const from = (i) => (i.sizes?.length ? Math.min(...i.sizes.map((s) => s.price)) : i.price);

  return (
    <div className="r-page">
      <header className="r-nav">
        <div className="r-nav-in">
          <a href="#top" className="r-logo"><span className="r-logo-ico">{t.emoji}</span><span>{r.name}</span></a>
          <nav className="l-links"><a href="#popular">Popular</a><a href="#categories">Menu</a><a href="#how">How to order</a><a href="#visit">Visit us</a></nav>
          <Link href={menuHref} className="btn light sm">View menu</Link>
        </div>
      </header>

      <section id="top" className="r-hero">
        <i className="orb o1" /><i className="orb o2" />
        <div className="l-wrap r-hero-grid">
          <div>
            <span className="eyebrow">{t.emoji} {t.label}{r.cuisine ? ` · ${r.cuisine}` : ''}</span>
            <h1>{r.name}</h1>
            <p className="lead">{t.tagline}. Scan the QR code on your table to see the menu and order, no waiting.</p>
            <div className="row" style={{ marginBottom: '1.4rem' }}>
              <Link href={menuHref} className="btn light lg">View menu & order <Icon name="arrow" size={18} /></Link>
              {r.phone && <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="btn outline lg">Call us</a>}
            </div>
            <div className="r-chips">
              {r.hours?.open && <span><Icon name="clock" size={15} /> Open {to12h(r.hours.open)} – {to12h(r.hours.close)}</span>}
              {r.address && <span><Icon name="store" size={15} /> {r.address}</span>}
              <span><Icon name="qr" size={15} /> QR table ordering</span>
            </div>
          </div>
          <div className="phone-stage" style={{ minHeight: 420 }}>
            <div className="qr-demo" style={{ transform: 'rotate(3deg)' }}>
              <div className="h">{r.name}</div>
              <QRDecor size={200} />
              <h2 style={{ margin: '.4rem 0 0' }}>Scan to order</h2>
              <div className="muted">Menu opens on your phone</div>
            </div>
          </div>
        </div>
      </section>

      {popular.length > 0 && (
        <section id="popular" className="l-section">
          <div className="l-wrap">
            <div className="l-title"><h2>Popular at {r.name}</h2><p>Guest favourites you shouldn't miss.</p></div>
            <div className="grid cols-3">
              {popular.map((i) => (
                <Link key={i._id} href={menuHref} className="card r-dish">
                  <div className="r-dish-img">{i.image ? <img src={i.image} alt={i.name} loading="lazy" /> : i.emoji || '🍽️'}</div>
                  <div className="row spread" style={{ flexWrap: 'nowrap', marginTop: '.8rem' }}><b><span className={`veg-dot ${i.veg ? '' : 'nonveg'}`} />{i.name}</b><b style={{ color: 'var(--brand-700)' }}>{i.sizes?.length ? 'from ' : ''}{cur}{from(i)}</b></div>
                  <div className="muted" style={{ marginTop: '.25rem' }}>{i.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {catCards.length > 0 && (
        <section id="categories" className="l-section alt">
          <div className="l-wrap">
            <div className="l-title"><h2>Explore the menu</h2><p>{items.length} dishes across {catCards.length} categories.</p></div>
            <div className="grid cols-4">
              {catCards.map((c) => (
                <Link key={c._id} href={menuHref} className="card feat">
                  <div className="stat-ico" style={{ fontSize: '1.5rem' }}>{c.list[0].emoji || '🍽️'}</div>
                  <h3>{c.name}</h3><p>{c.list.length} dish{c.list.length > 1 ? 'es' : ''}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="how" className="l-section">
        <div className="l-wrap">
          <div className="l-title"><h2>Order in three taps</h2></div>
          <div className="how">
            <div><h3>Scan the QR</h3><p>Find the QR code on your table and scan it with your phone camera.</p></div>
            <div><h3>Pick your dishes</h3><p>Choose sizes, add-ons and tell the kitchen how you like it.</p></div>
            <div><h3>Relax, we'll serve</h3><p>Track your order live while the kitchen prepares it fresh.</p></div>
          </div>
        </div>
      </section>

      <section id="visit" className="l-section" style={{ paddingTop: 0 }}>
        <div className="l-wrap">
          <div className="l-qr" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <h2>Visit {r.name}</h2>
              <div className="r-info">
                {r.address && <div><Icon name="store" size={18} /> <span>{r.address}</span></div>}
                {r.hours?.open && <div><Icon name="clock" size={18} /> <span>Every day, {to12h(r.hours.open)} – {to12h(r.hours.close)}</span></div>}
                {r.phone && <div><Icon name="phone" size={18} /> <a href={`tel:${r.phone.replace(/\s/g, '')}`}>{r.phone}</a></div>}
              </div>
              <Link href={menuHref} className="btn light lg" style={{ marginTop: '1.4rem' }}>Open the menu <Icon name="arrow" size={18} /></Link>
            </div>
            <div style={{ fontSize: '6rem', textAlign: 'center' }}>{t.emoji}</div>
          </div>
        </div>
      </section>

      <footer className="l-foot">
        <div className="l-wrap row spread">
          <span>© {new Date().getFullYear()} {r.name}</span>
          <span>Powered by <Link href="/" style={{ color: 'var(--brand-700)', fontWeight: 700 }}>OmniBite</Link> by Avocado Technologies</span>
        </div>
      </footer>
    </div>
  );
}
