import { useState } from 'react';
import { ArrowUpRight, Send, Wallet } from 'lucide-react';
import { Button, Card, EmptyState, Flag, Hash, PageHeader } from '../../components/ui';
import { formatInr, formatNumber, fxLine } from '../../format';
import { useStore } from '../../store';
import type { Asset } from '../../types';
import { TransferFlow } from './TransferFlow';
import { usePortfolio } from './usePortfolio';

export function Holdings() {
  const { setUi } = useStore();
  const p = usePortfolio();
  const [transferAsset, setTransferAsset] = useState<Asset | null>(null);

  return (
    <>
      <PageHeader title="Holdings" subtitle="Tokens held in your wallet, with on-chain proof for each position" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-navy-500">Total value</p>
          <p className="mt-1 text-lg font-semibold text-navy-950 md:text-xl">{formatInr(p.value)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-navy-500">Est. annual income</p>
          <p className="mt-1 text-lg font-semibold text-navy-950 md:text-xl">{formatInr(p.annualIncome)}</p>
        </Card>
        <Card className="col-span-2 p-4 md:col-span-1">
          <p className="text-xs text-navy-500">Positions</p>
          <p className="mt-1 text-lg font-semibold text-navy-950 md:text-xl">{p.count}</p>
        </Card>
      </div>

      {p.rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Wallet className="h-5 w-5" aria-hidden />}
            title="No holdings yet"
            body="Invest in a regulated offering to see it here."
            action={<Button onClick={() => setUi({ investorTab: 'explore' })}>Explore offerings</Button>}
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {p.rows.map(({ holding, asset, value }) => {
            const fx = fxLine(asset, value);
            const lastTx = holding.txHashes[holding.txHashes.length - 1];
            return (
              <li key={asset.id}>
                <Card className="p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-xs text-navy-500">
                        <Flag country={asset.country} /> {asset.assetClass} · {asset.symbol}
                      </p>
                      <h2 className="mt-1 font-semibold text-navy-950">{asset.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-navy-950">{formatInr(value)}</p>
                      {fx && <p className="text-[11px] text-navy-500">{fx}</p>}
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-navy-500">Tokens</dt>
                      <dd className="font-medium text-navy-900">{formatNumber(holding.tokens)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-navy-500">{asset.yieldPct != null ? asset.yieldLabel : 'Yield'}</dt>
                      <dd className="font-medium text-navy-900">{asset.yieldPct != null ? `${asset.yieldPct}%` : '-'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-navy-500">On-chain proof</dt>
                      <dd className="truncate text-sm">
                        <Hash hash={lastTx} />
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm" icon={<Send className="h-4 w-4" aria-hidden />} onClick={() => setTransferAsset(asset)}>
                      Transfer
                    </Button>
                    <Button variant="ghost" size="sm" icon={<ArrowUpRight className="h-4 w-4" aria-hidden />} onClick={() => setUi({ investorAssetId: asset.id })}>
                      View asset
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {transferAsset && <TransferFlow asset={transferAsset} onClose={() => setTransferAsset(null)} />}
    </>
  );
}
