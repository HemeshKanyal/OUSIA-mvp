import { ArrowLeftRight } from 'lucide-react';
import { OusiaSymbol } from '../../components/Logo';
import { Card, Flag, SectionTitle } from '../../components/ui';
import { formatInr, formatNumber } from '../../format';
import { useStore } from '../../store';

/** The India ⇄ UAE corridor: OUSIA's core story, computed live from the ledger. */
export function Corridor() {
  const { state, assetById } = useStore();
  const settlements = state.ledger.filter((e) => (e.type === 'INVEST' || e.type === 'TRANSFER') && e.status === 'CONFIRMED');
  const crossBorder = settlements.filter((e) => assetById(e.assetId)?.country === 'AE');
  const domestic = settlements.length - crossBorder.length;
  const value = settlements.reduce((n, e) => n + (e.amountInr ?? 0), 0);

  return (
    <Card as="section" className="overflow-hidden">
      <div className="px-4 pt-4 md:px-5">
        <SectionTitle>India ⇄ UAE settlement corridor</SectionTitle>
      </div>
      <div className="bg-hero mx-4 flex items-center gap-3 rounded-2xl p-4 text-white md:mx-5 md:gap-5 md:p-5">
        <div className="min-w-0 text-center">
          <Flag country="IN" className="h-5 w-7" />
          <p className="mt-1.5 text-sm font-semibold">India</p>
          <p className="text-[11px] text-ink-300">GIFT IFSC · IFSCA</p>
        </div>
        <div className="relative flex min-w-0 flex-1 items-center justify-center">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-white/20 via-brass-300 to-white/20" aria-hidden />
          <span className="corridor-dot absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-brass-300 shadow-[0_0_10px_2px_rgba(212,180,122,0.6)]" aria-hidden />
          <span className="relative flex items-center gap-1.5 rounded-full bg-ink-950 px-3 py-1.5 text-[11px] font-medium ring-1 ring-brass-300/60">
            <OusiaSymbol className="h-3 w-auto text-white" />
            <span className="hidden sm:inline">OUSIA settlement layer</span>
            <ArrowLeftRight className="h-3 w-3 text-brass-300 sm:hidden" aria-hidden />
          </span>
        </div>
        <div className="min-w-0 text-center">
          <Flag country="AE" className="h-5 w-7" />
          <p className="mt-1.5 text-sm font-semibold">UAE</p>
          <p className="text-[11px] text-ink-300">VARA · ADGM</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4 md:p-5">
        {[
          ['Cross-border settlements', formatNumber(crossBorder.length)],
          ['Domestic settlements', formatNumber(domestic)],
          ['Value settled', formatInr(value)],
          ['Settlement time', '1.2s · 24x7'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-ink-500">{k}</dt>
            <dd key={v} className="animate-fade mt-0.5 text-lg font-semibold text-ink-950">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
