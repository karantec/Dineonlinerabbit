import Brand from '@/components/Brand';
import Icon from '@/components/Icon';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Brand />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2>Every table, one scan away.</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Digital menu with QR ordering', 'Live kitchen display', 'Analytics & reports on login', 'Bills & PDF receipts'].map((t) => (
              <li key={t} className="row" style={{ gap: '.6rem', flexWrap: 'nowrap' }}><Icon name="check" size={18} />{t}</li>
            ))}
          </ul>
        </div>
        <div style={{ opacity: .7, fontSize: '.85rem' }}>© OmniBite by Avocado Technologies</div>
      </aside>
      <main className="auth-main">
        <div className="auth-box">
          <h1 style={{ fontSize: '1.8rem', marginBottom: '.3rem' }}>{title}</h1>
          <p className="muted" style={{ fontSize: '.95rem', marginBottom: '1rem' }}>{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
