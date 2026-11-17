import Link from 'next/link';

export default function NotFound() {
  return (<div className="center"><div className="card" style={{ textAlign: 'center', maxWidth: 380 }}><h1>Page not found</h1><p className="muted">The page you are looking for doesn't exist.</p><Link className="btn" href="/">Go home</Link></div></div>);
}
