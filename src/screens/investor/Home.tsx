import { ArrowRight, Compass, Plus, Wallet } from 'lucide-react';
import { Button, Card, Hash, SectionTitle } from '../../components/ui';
import { EventBadge } from '../../components/LedgerTable';
import { EVENT_LABEL, formatInr, timeAgo } from '../../format';
import { useStore } from '../../store';
import { usePortfolio } from './usePortfolio';

// Allocation colours on the dark card: whites and brasses only, matching the brand
const CLASS_COLOR = { Bond: '#f5f5f5', 'Real Estate': '#d4b47a', Gold: '#a07a3d', 'T-Bill': '#8f8f8f' } as const;
import { AssetCard } from './AssetCard';

export function Home() {
  const { state, priya, setUi, addFunds, toast, assetById } = useStore();
  const p = usePortfolio();
  const live = state.assets.filter((a) => a.status === 'LIVE');
  const allocation = (['Bond', 'Real Estate', 'Gold', 'T-Bill'] as const)
    .map((cls) => ({
      label: cls === 'T-Bill' ? 'T-Bills' : cls === 'Bond' ? 'Bonds' : cls,
      color: CLASS_COLOR[cls],
      pct: p.value ? Math.round((p.rows.filter((r) => r.asset.assetClass === cls).reduce((n, r) => n + r.value, 0) / p.value) * 100) : 0,
    }))
    .filter((a) => a.pct > 0);
  const featured = [...live].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 3);
  const activity = state.ledger
    .filter((e) => e.to === priya.wallet || e.from === priya.wallet)
    .sort((a, b) => b.block - a.block)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-500">Good to see you,</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink-950 md:text-2xl">{priya.name}</h1>
      </div>

      <section aria-label="Portfolio" className="bg-hero rounded-3xl bg-ink-900 p-5 text-white shadow-lg md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brass-300">Portfolio value</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{formatInr(p.value)}</p>
            <p className="mt-1 text-sm text-ink-200">
              {p.count} holding{p.count === 1 ? '' : 's'} · est. income {formatInr(p.annualIncome)}/yr
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/10 backdrop-blur">
            <p className="text-xs text-ink-200">Cash balance</p>
            <p className="text-lg font-semibold">{formatInr(priya.balance)}</p>
          </div>
        </div>
        {p.value > 0 && (
          <div className="mt-5">
            <div className="flex h-2 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`Allocation: ${allocation.map((a) => `${a.label} ${a.pct}%`).join(', ')}`}>
              {allocation.map((a) => (
                <div key={a.label} style={{ width: `${a.pct}%`, background: a.color }} />
              ))}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-200">
              {allocation.map((a) => (
                <li key={a.label} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: a.color }} aria-hidden />
                  {a.label} <span className="text-white">{a.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="inverse" size="sm" icon={<Compass className="h-4 w-4" aria-hidden />} onClick={() => setUi({ investorTab: 'explore' })}>
            Explore offerings
          </Button>
          <Button
            variant="onDark"
            size="sm"
            icon={<Wallet className="h-4 w-4" aria-hidden />}
            onClick={() => setUi({ investorTab: 'holdings' })}
          >
            Holdings
          </Button>
          <Button
            variant="onDark"
            size="sm"
            icon={<Plus className="h-4 w-4" aria-hidden />}
            onClick={() => {
              addFunds(25_000);
              toast({ tone: 'success', title: 'Funds added', body: '₹25,000 added via UPI (simulated).' });
            }}
          >
            Add ₹25,000
          </Button>
        </div>
      </section>

      <section>
        <SectionTitle
          action={
            <Button variant="ghost" size="sm" onClick={() => setUi({ investorTab: 'explore' })}>
              See all <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          }
        >
          Open for investment
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Recent activity</SectionTitle>
        <Card>
          <ul className="divide-y divide-ink-100">
            {activity.map((e) => {
              const asset = assetById(e.assetId);
              return (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <EventBadge type={e.type} />
                      <span className="text-xs text-ink-500">{timeAgo(e.timestamp)}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-ink-800">{asset?.name ?? EVENT_LABEL[e.type]}</p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    {e.amountInr != null && <p className="font-medium text-ink-900">{formatInr(e.amountInr)}</p>}
                    <Hash hash={e.txHash} className="text-xs" />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>
    </div>
  );
}
