import Link from 'next/link';
import Icon from '@/components/Icon';

// OmniBite logo lock-up. `sub` shows "by Avocado Technologies" under the name.
export default function Brand({ href = '/', sub = true }) {
  return (
    <Link href={href} className="brand-lock">
      <span className="brand-mark"><Icon name="leaf" size={19} /></span>
      <span>
        <span className="brand-name">OmniBite</span>
        {sub && <small className="brand-sub">by Avocado Technologies</small>}
      </span>
    </Link>
  );
}
