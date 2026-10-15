import type { Asset } from '../types';
import { cx } from './ui';

/**
 * Geometric cover art per asset, drawn in the logo's square-and-line language:
 * white strokes on the charcoal gradient, with brass for the one detail that matters.
 */
const LINE = 'rgba(255,255,255,0.42)';
const FAINT = 'rgba(255,255,255,0.08)';
const BRASS = '#d4b47a';

function Towers() {
  // Dubai Marina: slender towers above a waterline
  const towers = [
    [150, 16, 58],
    [172, 14, 74],
    [192, 20, 92],
    [218, 15, 66],
    [240, 22, 84],
    [268, 14, 52],
    [288, 18, 70],
  ];
  return (
    <>
      {towers.map(([x, w, h], i) => (
        <rect key={i} x={x} y={100 - h} width={w} height={h} fill={i === 2 ? 'rgba(212,180,122,0.18)' : FAINT} stroke={i === 2 ? BRASS : LINE} strokeWidth="1.5" />
      ))}
      <rect x={198} y={42} width={8} height={8} fill="none" stroke={BRASS} strokeWidth="1.5" />
      <path d="M120 104 q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke={LINE} strokeWidth="1.5" />
    </>
  );
}

function Offices() {
  // Mumbai BKC and other commercial property: wide blocks with floor lines
  const blocks = [
    [150, 44, 58],
    [200, 54, 82],
    [260, 46, 66],
  ];
  return (
    <>
      {blocks.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={102 - h} width={w} height={h} fill={i === 1 ? 'rgba(212,180,122,0.16)' : FAINT} stroke={i === 1 ? BRASS : LINE} strokeWidth="1.5" />
          {Array.from({ length: Math.floor(h / 9) - 1 }, (_, f) => (
            <line key={f} x1={x + 5} x2={x + w - 5} y1={102 - h + 9 * (f + 1)} y2={102 - h + 9 * (f + 1)} stroke={i === 1 ? 'rgba(212,180,122,0.55)' : 'rgba(255,255,255,0.18)'} strokeWidth="1" />
          ))}
        </g>
      ))}
      <line x1={120} x2={320} y1={102} y2={102} stroke={LINE} strokeWidth="1.5" />
    </>
  );
}

function Bars() {
  // Gold: a stack of bars
  const bar = (x: number, y: number, key: string, accent = false) => (
    <polygon key={key} points={`${x + 6},${y} ${x + 46},${y} ${x + 52},${y + 20} ${x},${y + 20}`} fill={accent ? 'rgba(212,180,122,0.35)' : 'rgba(212,180,122,0.12)'} stroke={BRASS} strokeWidth="1.5" />
  );
  return (
    <>
      {bar(160, 80, 'a')}
      {bar(216, 80, 'b')}
      {bar(272, 80, 'c')}
      {bar(188, 56, 'd')}
      {bar(244, 56, 'e')}
      {bar(216, 32, 'f', true)}
    </>
  );
}

function Ledger() {
  // Bonds: a coupon schedule, each line ending in a payment date
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const y = 24 + i * 14;
        const end = 190 + ((i * 37) % 90);
        const paid = i < 4;
        return (
          <g key={i}>
            <line x1={150} x2={end} y1={y} y2={y} stroke={LINE} strokeWidth="1.5" />
            <rect x={end + 4} y={y - 4} width={8} height={8} fill={paid ? BRASS : 'none'} stroke={paid ? BRASS : LINE} strokeWidth="1.5" />
          </g>
        );
      })}
    </>
  );
}

function Calendar() {
  // T-Bill: 91 days as 13 weeks, elapsed days in brass
  const cells = [];
  for (let c = 0; c < 13; c++) {
    for (let r = 0; r < 7; r++) {
      const day = c * 7 + r;
      cells.push(<rect key={day} x={164 + c * 11} y={20 + r * 11} width={8} height={8} fill={day < 34 ? 'rgba(212,180,122,0.75)' : 'rgba(255,255,255,0.14)'} />);
    }
  }
  return <>{cells}</>;
}

function art(asset: Asset) {
  if (asset.id === 'dubai-marina-1204') return <Towers />;
  switch (asset.assetClass) {
    case 'Real Estate':
      return asset.country === 'AE' ? <Towers /> : <Offices />;
    case 'Gold':
      return <Bars />;
    case 'T-Bill':
      return <Calendar />;
    default:
      return <Ledger />;
  }
}

export function AssetArt({ asset, className, children }: { asset: Asset; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cx('bg-hero relative overflow-hidden', className)}>
      <svg viewBox="0 0 320 112" preserveAspectRatio="xMaxYMax meet" className="absolute inset-y-0 right-0 h-full w-auto max-w-full" aria-hidden>
        {art(asset)}
      </svg>
      {children && <div className="relative">{children}</div>}
    </div>
  );
}
