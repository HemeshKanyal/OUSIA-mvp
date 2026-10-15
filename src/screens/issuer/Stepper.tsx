import { Check, X } from 'lucide-react';
import { cx } from '../../components/ui';
import { formatDateTime } from '../../format';
import { useStore } from '../../store';
import type { Asset, LedgerEventType } from '../../types';

const STEPS: { label: string; event: LedgerEventType }[] = [
  { label: 'Asset submitted', event: 'ASSET_SUBMITTED' },
  { label: 'Legal verification', event: 'LEGAL_VERIFIED' },
  { label: 'Compliance review', event: 'APPROVE' },
  { label: 'Token issuance', event: 'MINT' },
  { label: 'Distribution', event: 'INVEST' },
];

/** Index of the step currently in progress. */
function currentIndex(asset: Asset): number {
  switch (asset.status) {
    case 'SUBMITTED':
      return 1;
    case 'IN_REVIEW':
    case 'REJECTED':
      return 2;
    case 'APPROVED':
      return 3;
    case 'LIVE':
      return 4;
  }
}

export function IssuanceStepper({ asset }: { asset: Asset }) {
  const { state } = useStore();
  const current = currentIndex(asset);
  const rejected = asset.status === 'REJECTED';
  const eventTime = (type: LedgerEventType) => {
    const matches = state.ledger.filter((e) => e.assetId === asset.id && e.type === type);
    const ev = type === 'INVEST' ? matches[0] : matches[matches.length - 1];
    return ev?.timestamp;
  };

  return (
    <ol className="grid gap-0 md:grid-cols-5 md:gap-2" aria-label="Issuance workflow">
      {STEPS.map((step, i) => {
        const done = i < current || (i === 4 && asset.status === 'LIVE' && asset.tokensSold > 0);
        const active = i === current && !done;
        const failed = active && rejected;
        const when = done ? eventTime(step.event) : undefined;
        const status = failed ? 'Rejected' : done ? 'Complete' : active ? (i === 4 ? 'Open' : 'In progress') : 'Pending';
        return (
          <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0 md:flex-col md:gap-2 md:pb-0" aria-current={active ? 'step' : undefined}>
            {i < STEPS.length - 1 && (
              <span aria-hidden className={cx('absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 md:left-8 md:top-[15px] md:h-0.5 md:w-[calc(100%-1.5rem)]', done ? 'bg-accent-500' : 'bg-ink-100')} />
            )}
            <span
              key={`${step.label}-${status}`}
              className={cx(
                'animate-pop relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                done && 'bg-accent-600 text-white',
                active && !failed && 'bg-ink-gradient text-white ring-4 ring-brass-200',
                failed && 'bg-red-600 text-white ring-4 ring-red-100',
                !done && !active && 'bg-white text-ink-500 ring-1 ring-ink-200',
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : failed ? <X className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span className="min-w-0 pt-1 md:pt-0">
              <span className="block text-sm font-medium text-ink-900">{step.label}</span>
              <span className={cx('block text-xs', failed ? 'text-red-700' : active ? 'font-medium text-ink-800' : 'text-ink-500')}>
                {status}
                {when ? ` · ${formatDateTime(when)}` : ''}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
