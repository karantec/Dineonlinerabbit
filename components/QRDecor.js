// Decorative (non-scannable) QR-style graphic for the landing page.
export default function QRDecor({ size = 220, color = '#15210b' }) {
  const N = 25;
  let s = 7;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  const cells = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && rnd() > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  const finder = (x, y) => (
    <g key={`f${x}${y}`}>
      <rect x={x} y={y} width="7" height="7" rx="1.2" />
      <rect x={x + 1} y={y + 1} width="5" height="5" rx=".8" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" rx=".5" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${N + 2} ${N + 2}`} fill={color} role="img" aria-label="QR code illustration">
      {cells}
      {finder(0, 0)}{finder(N - 7, 0)}{finder(0, N - 7)}
    </svg>
  );
}
