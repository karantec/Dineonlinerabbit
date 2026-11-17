'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Icon from '@/components/Icon';

export default function QRStudio() {
  const [r, setR] = useState(null);
  const [base, setBase] = useState('');
  const [color, setColor] = useState('#3d4420');
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(10);
  const [imgs, setImgs] = useState({});
  const [main, setMain] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/settings').then((x) => x.json()).then((d) => { setR(d.restaurant); setTo(Math.min(d.restaurant.tables || 10, 60)); });
    let saved = '';
    try { saved = localStorage.getItem('omnibite_base') || ''; } catch {}
    setBase(saved || window.location.origin);
  }, []);

  const clean = (b) => b.trim().replace(/\/+$/, '');
  const url = (t) => `${clean(base)}/${r.slug}/menu${t ? `?table=${t}` : ''}`;

  useEffect(() => {
    if (!r || !base) return;
    try { localStorage.setItem('omnibite_base', base); } catch {}
    let live = true;
    (async () => {
      const opts = { width: 480, margin: 1, errorCorrectionLevel: 'M', color: { dark: color, light: '#ffffff' } };
      const tables = Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
      const list = await Promise.all(tables.map((t) => QRCode.toDataURL(url(t), opts)));
      const m = await QRCode.toDataURL(url(), opts);
      if (live) { setImgs(Object.fromEntries(tables.map((t, i) => [t, list[i]]))); setMain(m); }
    })();
    return () => { live = false; };
  }, [r, base, color, from, to]);

  if (!r) return <div className="skel" style={{ height: 300 }} />;

  const download = (src, name) => { const a = document.createElement('a'); a.href = src; a.download = name; a.click(); };
  const copy = async (text, key) => { try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1500); } catch {} };
  const isLocal = /localhost|127\.0\.0\.1/.test(base);

  return (
    <>
      <div className="page-head no-print">
        <div><h1>QR Codes</h1><p>Generate, download and print table QR codes for {r.name}.</p></div>
        <button className="btn" onClick={() => window.print()}><Icon name="printer" size={17} /> Print all cards</button>
      </div>

      <div className="card no-print" style={{ marginBottom: '1rem' }}>
        <div className="steps-inline"><span><b>1</b> Choose your tables</span><Icon name="arrow" size={14} /><span><b>2</b> Pick a colour</span><Icon name="arrow" size={14} /><span><b>3</b> Download PNGs or print the cards</span><Icon name="arrow" size={14} /><span><b>4</b> Stick one on each table</span></div>
      </div>

      <div className="grid cols-2 no-print" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <h3>Settings</h3>
          <div className="row" style={{ gap: '.7rem', flexWrap: 'nowrap' }}>
            <div style={{ flex: 1 }}><label>From table</label><input type="number" min="1" value={from} onChange={(e) => setFrom(Math.max(1, +e.target.value || 1))} /></div>
            <div style={{ flex: 1 }}><label>To table</label><input type="number" min={from} max="200" value={to} onChange={(e) => setTo(Math.min(200, Math.max(from, +e.target.value || from)))} /></div>
            <div style={{ width: 90 }}><label>Colour</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></div>
          </div>
          <label>Website address used inside the QR</label>
          <input value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://yourdomain.com" />
          <p className="muted" style={{ marginTop: '.4rem' }}>
            {isLocal ? <span style={{ color: 'var(--warn)' }}>⚠ localhost only works on this computer. To scan with a phone, use your live domain or your computer's network address (e.g. http://192.168.1.5:3000).</span> : 'Guests who scan will open this address.'}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Restaurant menu link</h3>
          <p className="muted">General QR without a table number: good for posters, flyers and your window.</p>
          {main && <img src={main} alt="Menu QR" width={150} height={150} />}
          <div style={{ wordBreak: 'break-all' }} className="muted">{url()}</div>
          <div className="row" style={{ justifyContent: 'center', marginTop: '.6rem' }}>
            <button className="btn ghost sm" onClick={() => download(main, `${r.slug}-menu.png`)}><Icon name="download" size={14} /> PNG</button>
            <button className="btn ghost sm" onClick={() => copy(url(), 'main')}><Icon name="copy" size={14} /> {copied === 'main' ? 'Copied!' : 'Copy link'}</button>
            <a className="btn ghost sm" href={url()} target="_blank" rel="noreferrer"><Icon name="external" size={14} /> Open</a>
          </div>
        </div>
      </div>

      <div className="qr-grid">
        {Object.entries(imgs).map(([t, src]) => (
          <div key={t} className="qr-card">
            <div className="qr-card-h" style={{ background: color }}>{r.name}</div>
            <img src={src} alt={`QR for table ${t}`} />
            <div className="qr-card-f">
              <h2>Table {t}</h2>
              <div className="muted">Scan to view the menu & order</div>
              <div className="row no-print" style={{ justifyContent: 'center', marginTop: '.6rem', gap: '.4rem' }}>
                <button className="btn ghost sm" onClick={() => download(src, `${r.slug}-table-${t}.png`)}><Icon name="download" size={14} /> PNG</button>
                <button className="btn ghost sm" onClick={() => copy(url(t), t)}><Icon name="copy" size={14} /> {copied === t ? 'Copied!' : 'Link'}</button>
                <a className="btn ghost sm" href={url(t)} target="_blank" rel="noreferrer" aria-label="Open"><Icon name="external" size={14} /></a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
