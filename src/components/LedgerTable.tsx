import { Ban } from 'lucide-react';
import { EVENT_LABEL, formatBlock, formatDateTime, formatInr, formatNumber, formatTime, shortHash } from '../format';
import { useStore } from '../store';
import type { LedgerEvent, LedgerEventType } from '../types';
import { Badge, Hash, cx } from './ui';

const TYPE_TONE: Partial<Record<LedgerEventType, 'green' | 'red' | 'blue' | 'navy' | 'amber' | 'neutral'>> = {
  INVEST: 'green',
  TRANSFER: 'green',
  DISTRIBUTION: 'green',
  TRANSFER_BLOCKED: 'red',
  REJECT: 'red',
  KYC_REJECTED: 'red',
  WALLET_FROZEN: 'red',
  MINT: 'navy',
  APPROVE: 'blue',
  KYC_VERIFIED: 'blue',
  SANCTIONS_CLEARED: 'blue',
  LEGAL_VERIFIED: 'blue',
  CONTROL_UPDATED: 'amber',
};

export function EventBadge({ type }: { type: LedgerEventType }) {
  return (
    <Badge tone={TYPE_TONE[type] ?? 'neutral'}>
      {type === 'TRANSFER_BLOCKED' && <Ban className="h-3 w-3" aria-hidden />}
      {EVENT_LABEL[type]}
    </Badge>
  );
}

function Party({ label, address }: { label: string; address: string }) {
  return (
    <span className="block min-w-0">
      <span className="block truncate text-navy-900">{label}</span>
      <span className="block truncate font-mono text-[11px] text-navy-500">{shortHash(address, 4, 4)}</span>
    </span>
  );
}

function Amount({ e }: { e: LedgerEvent }) {
  const { assetById } = useStore();
  const asset = assetById(e.assetId);
  if (e.tokens == null && e.amountInr == null) return <span className="text-navy-400">-</span>;
  return (
    <span className="block whitespace-nowrap">
      {e.tokens != null && (
        <span className="block text-navy-900">
          {formatNumber(e.tokens)} {asset?.symbol}
        </span>
      )}
      {e.amountInr != null && <span className="block text-xs text-navy-500">{formatInr(e.amountInr)}</span>}
    </span>
  );
}

export function LedgerTable({ events, empty = 'No events yet.' }: { events: LedgerEvent[]; empty?: string }) {
  const { assetById, openTx } = useStore();
  const rows = [...events].sort((a, b) => b.block - a.block || b.timestamp - a.timestamp);
  if (rows.length === 0) return <p className="px-4 py-10 text-center text-sm text-navy-500">{empty}</p>;

  return (
    <>
      {/* Compact list below xl */}
      <ul className="divide-y divide-navy-100 xl:hidden">
        {rows.map((e) => {
          const blocked = e.status === 'BLOCKED';
          const asset = assetById(e.assetId);
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => openTx(e.txHash)}
                className={cx('flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-navy-50', blocked && 'bg-red-50/70 hover:bg-red-50')}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <EventBadge type={e.type} />
                    <span className="text-xs text-navy-500">{formatDateTime(e.timestamp)}</span>
                  </div>
                  <p className={cx('mt-1 truncate text-sm', blocked ? 'text-red-800' : 'text-navy-800')}>
                    {e.fromLabel} → {e.toLabel}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-navy-500">
                    {asset ? asset.name : e.memo} · <span className="font-mono">{shortHash(e.txHash)}</span> · {formatBlock(e.block)}
                  </p>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <Amount e={e} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Full table on wide screens */}
      <table className="hidden w-full table-fixed text-left text-sm xl:table">
        <thead className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
          <tr>
            <th scope="col" className="w-[13%] px-4 py-3 font-medium">Time</th>
            <th scope="col" className="w-[17%] px-3 py-3 font-medium">Type</th>
            <th scope="col" className="w-[22%] px-3 py-3 font-medium">From → To</th>
            <th scope="col" className="w-[22%] px-3 py-3 font-medium">Asset · Amount</th>
            <th scope="col" className="w-[14%] px-3 py-3 font-medium">Tx hash</th>
            <th scope="col" className="w-[12%] px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-100">
          {rows.map((e) => {
            const blocked = e.status === 'BLOCKED';
            const asset = assetById(e.assetId);
            return (
              <tr key={e.id} onClick={() => openTx(e.txHash)} className={cx('cursor-pointer align-top', blocked ? 'bg-red-50 hover:bg-red-100/70' : 'hover:bg-navy-50')}>
                <td className="px-4 py-3 text-navy-600">
                  <span className="block whitespace-nowrap">{formatTime(e.timestamp)}</span>
                  <span className="block font-mono text-[11px] text-navy-500">{formatBlock(e.block)}</span>
                </td>
                <td className="px-3 py-3">
                  <EventBadge type={e.type} />
                </td>
                <td className="px-3 py-3">
                  <Party label={e.fromLabel} address={e.from} />
                  <span className="my-0.5 block text-[11px] text-navy-400" aria-hidden>
                    ↓
                  </span>
                  <Party label={e.toLabel} address={e.to} />
                </td>
                <td className="px-3 py-3">
                  <span className="mb-1 block truncate text-navy-800">{asset?.name ?? e.memo}</span>
                  <Amount e={e} />
                </td>
                <td className="px-3 py-3">
                  <Hash hash={e.txHash} className="whitespace-nowrap text-xs" />
                </td>
                <td className="px-4 py-3">
                  {blocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="green">Confirmed</Badge>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
