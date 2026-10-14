import { ArrowRight, Compass, Plus, Wallet } from 'lucide-react';
import { Button, Card, Hash, SectionTitle } from '../../components/ui';
import { EventBadge } from '../../components/LedgerTable';
import { EVENT_LABEL, formatInr, timeAgo } from '../../format';
import { useStore } from '../../store';
import { usePortfolio } from './usePortfolio';
import { AssetCard } from './AssetCard';

export function Home() {
  const { state, priya, setUi, addFunds, toast, assetById } = useStore();
  const p = usePortfolio();
  const live = state.assets.filter((a) => a.status === 'LIVE');
  const featured = [...live].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 3);
  const activity = state.ledger
    .filter((e) => e.to === priya.wallet || e.from === priya.wallet)
    .sort((a, b) => b.block - a.block)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-navy-500">Good to see you,</p>
        <h1 className="text-xl font-semibold tracking-tight text-navy-950 md:text-2xl">{priya.name}</h1>
      </div>

      <section aria-label="Portfolio" className="rounded-3xl bg-navy-900 p-5 text-white shadow-card md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-navy-200">Portfolio value</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{formatInr(p.value)}</p>
            <p className="mt-1 text-sm text-navy-200">
              {p.count} holding{p.count === 1 ? '' : 's'} · est. income {formatInr(p.annualIncome)}/yr
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs text-navy-200">Cash balance</p>
            <p className="text-lg font-semibold">{formatInr(priya.balance)}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="accent" size="sm" icon={<Compass className="h-4 w-4" aria-hidden />} onClick={() => setUi({ investorTab: 'explore' })}>
            Explore offerings
          </Button>
          <Button
            size="sm"
            className="bg-white/10 hover:bg-white/20"
            icon={<Wallet className="h-4 w-4" aria-hidden />}
            onClick={() => setUi({ investorTab: 'holdings' })}
          >
            Holdings
          </Button>
          <Button
            size="sm"
            className="bg-white/10 hover:bg-white/20"
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
          <ul className="divide-y divide-navy-100">
            {activity.map((e) => {
              const asset = assetById(e.assetId);
              return (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <EventBadge type={e.type} />
                      <span className="text-xs text-navy-500">{timeAgo(e.timestamp)}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-navy-800">{asset?.name ?? EVENT_LABEL[e.type]}</p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    {e.amountInr != null && <p className="font-medium text-navy-900">{formatInr(e.amountInr)}</p>}
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
