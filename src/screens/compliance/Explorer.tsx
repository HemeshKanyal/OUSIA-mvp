import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { LedgerTable } from '../../components/LedgerTable';
import { Card } from '../../components/ui';
import { DEMO_STEPS } from '../../demo';
import { EVENT_LABEL, formatNumber, formatBlock } from '../../format';
import { useStore } from '../../store';
import type { LedgerEventType } from '../../types';

export function Explorer() {
  const { state, markAuditViewed, assetById } = useStore();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<LedgerEventType | 'ALL'>('ALL');
  const jur = state.ui.jurisdictionFilter;

  // Demo script step 3: the presenter has looked at the log after the purchase and blocked transfer.
  const readyForStep3 = DEMO_STEPS[0].done(state) && DEMO_STEPS[1].done(state);
  useEffect(() => {
    if (readyForStep3 && !state.demo.auditViewed) markAuditViewed();
  }, [readyForStep3, state.demo.auditViewed, markAuditViewed]);

  const q = query.trim().toLowerCase();
  const events = state.ledger.filter((e) => {
    if (jur !== 'ALL' && e.jurisdiction !== jur) return false;
    if (type !== 'ALL' && e.type !== type) return false;
    if (!q) return true;
    const asset = assetById(e.assetId);
    return [e.txHash, e.fromLabel, e.toLabel, e.from, e.to, e.memo, asset?.name ?? '', EVENT_LABEL[e.type]].some((s) => s.toLowerCase().includes(q));
  });
  const scoped = state.ledger.filter((e) => jur === 'ALL' || e.jurisdiction === jur);
  const types = Array.from(new Set(state.ledger.map((e) => e.type)));
  const lastBlock = state.ledger.reduce((n, e) => Math.max(n, e.block), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Events', formatNumber(scoped.length)],
          ['Blocked', formatNumber(scoped.filter((e) => e.status === 'BLOCKED').length)],
          ['Latest block', formatBlock(lastBlock)],
          ['Avg. settlement', '1.2s'],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <p className="text-xs text-ink-500">{k}</p>
            <p className="mt-1 truncate text-lg font-semibold text-ink-950">{v}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="ex-search" className="sr-only">
              Search by hash, party or asset
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              id="ex-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tx hash, party or asset"
              className="h-10 w-full rounded-xl border border-ink-200 pl-9 pr-3 text-ink-900"
            />
          </div>
          <div>
            <label htmlFor="ex-type" className="sr-only">
              Event type
            </label>
            <select id="ex-type" value={type} onChange={(e) => setType(e.target.value as LedgerEventType | 'ALL')} className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-ink-900 sm:w-48">
              <option value="ALL">All event types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {EVENT_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <LedgerTable events={events} empty={jur === 'ADGM' ? 'No on-chain events for ADGM assets yet.' : 'No events match these filters.'} />
      </Card>
    </div>
  );
}
