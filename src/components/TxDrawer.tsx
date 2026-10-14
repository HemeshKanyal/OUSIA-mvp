import { Ban, CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { EVENT_LABEL, JURISDICTION_LABEL, formatDateTime, formatInr, formatNumber, formatBlock } from '../format';
import { useStore } from '../store';
import { Button, CopyButton, Drawer, KeyValue, cx } from './ui';

export function TxDrawer() {
  const { state, txDrawer, openTx, assetById, setUi } = useStore();
  const ev = txDrawer ? state.ledger.find((e) => e.txHash === txDrawer) : undefined;
  const asset = assetById(ev?.assetId);
  const blocked = ev?.status === 'BLOCKED';

  return (
    <Drawer open={!!txDrawer} onClose={() => openTx(null)} title="OUSIA Explorer · Transaction">
      {!ev ? (
        <p className="text-sm text-navy-500">Transaction not found. It may have been cleared by a demo reset.</p>
      ) : (
        <div className="space-y-5">
          <div className={cx('flex items-start gap-3 rounded-2xl p-4', blocked ? 'bg-red-50 text-red-900' : 'bg-accent-50 text-accent-700')}>
            {blocked ? <Ban className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />}
            <div className="min-w-0">
              <p className="font-semibold">{blocked ? 'Reverted by compliance rule' : `Confirmed in ${(ev.durationMs / 1000).toFixed(1)}s`}</p>
              <p className="mt-0.5 text-sm">{ev.memo}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-navy-500">Transaction hash</p>
            <div className="mt-1 flex items-start gap-1">
              <p className="min-w-0 flex-1 break-all font-mono text-xs text-navy-900">{ev.txHash}</p>
              <CopyButton value={ev.txHash} label="Copy transaction hash" />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <KeyValue label="Type">{EVENT_LABEL[ev.type]}</KeyValue>
            <KeyValue label="Block">{formatBlock(ev.block)}</KeyValue>
            <KeyValue label="Timestamp">{formatDateTime(ev.timestamp)}</KeyValue>
            <KeyValue label="Jurisdiction">{JURISDICTION_LABEL[ev.jurisdiction]}</KeyValue>
            <KeyValue label="From">
              {ev.fromLabel}
              <span className="block break-all font-mono text-[11px] font-normal text-navy-500">{ev.from}</span>
            </KeyValue>
            <KeyValue label="To">
              {ev.toLabel}
              <span className="block break-all font-mono text-[11px] font-normal text-navy-500">{ev.to}</span>
            </KeyValue>
            {asset && <KeyValue label="Asset">{asset.name}</KeyValue>}
            {ev.tokens != null && (
              <KeyValue label="Tokens">
                {formatNumber(ev.tokens)} {asset?.symbol}
              </KeyValue>
            )}
            {ev.amountInr != null && <KeyValue label="Value">{formatInr(ev.amountInr)}</KeyValue>}
            <KeyValue label="Gas used">{formatNumber(ev.gasUsed)}</KeyValue>
          </dl>

          {ev.checks && ev.checks.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-navy-900">Rule engine trace</p>
              <ul className="space-y-2">
                {ev.checks.map((c) => (
                  <li key={c.rule} className={cx('flex items-start gap-2 rounded-xl border px-3 py-2', c.passed ? 'border-navy-100' : 'border-red-200 bg-red-50')}>
                    {c.passed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-label="Passed" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-label="Failed" />
                    )}
                    <div className="min-w-0">
                      <p className={cx('text-sm font-medium', c.passed ? 'text-navy-900' : 'text-red-800')}>{c.rule}</p>
                      <p className="break-words font-mono text-[11px] text-navy-500">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-navy-500">Network: OUSIA Chain (simulated permissioned EVM). Token standard: ERC-3643 style permissioned token.</p>

          <Button
            variant="secondary"
            className="w-full"
            icon={<ExternalLink className="h-4 w-4" aria-hidden />}
            onClick={() => {
              openTx(null);
              setUi({ role: 'compliance', complianceTab: 'explorer' });
            }}
          >
            Open full audit log
          </Button>
        </div>
      )}
    </Drawer>
  );
}
