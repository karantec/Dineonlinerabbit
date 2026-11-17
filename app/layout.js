import './globals.css';

export const metadata = {
  title: { default: 'OmniBite by Avocado Technologies', template: '%s · OmniBite' },
  description: 'OmniBite by Avocado Technologies: digital menu, QR ordering, live kitchen display and analytics for restaurants, cafes and dhabas.',
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0a0a0a' };

export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
