import { CheckCircle2, Coins } from 'lucide-react';
import { Card, CopyButton, EmptyState, Hash, KeyValue, PageHeader, StatusBadge } from '../../components/ui';
import { formatNumber } from '../../format';
import { useStore } from '../../store';
import { useIssuerAssets } from './useIssuerAssets';

const MODULES = ['Identity registry (KYC claims)', 'Country restrictions', 'Max holders per jurisdiction', 'Transfer lock-up rules', 'Forced transfer / recovery (regulator)'];

export function IssuerTokens() {
  const { state } = useStore();
  const { assets } = useIssuerAssets();

  return (
    <>
      <PageHeader title="Tokens" subtitle="Permissioned token contracts (ERC-3643 style) for ABC Capital assets" />
      <div className="grid gap-4 lg:grid-cols-2">
        {assets.map((asset) => {
          const mint = state.ledger.find((e) => e.assetId === asset.id && e.type === 'MINT');
          const holders = state.holdings.filter((h) => h.assetId === asset.id && h.tokens > 0).length;
          return (
            <Card key={asset.id} as="article" className="min-w-0 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-navy-950">{asset.symbol}</p>
                  <h2 className="truncate text-sm text-navy-600">{asset.name}</h2>
                </div>
                <StatusBadge status={asset.status} />
              </div>
              {!mint ? (
                <EmptyState icon={<Coins className="h-5 w-5" aria-hidden />} title="Not issued yet" body="The contract deploys and mints once Compliance approves the asset." />
              ) : (
                <>
                  <dl className="mt-4 grid grid-cols-2 gap-4">
                    <KeyValue label="Total supply">{formatNumber(asset.totalTokens)}</KeyValue>
                    <KeyValue label="Distributed">{formatNumber(asset.tokensSold)}</KeyValue>
                    <KeyValue label="Holders">{formatNumber(holders)}</KeyValue>
                    <KeyValue label="Mint tx">
                      <Hash hash={mint.txHash} />
                    </KeyValue>
                    <div className="col-span-2">
                      <KeyValue label="Contract">
                        <span className="flex items-start gap-1">
                          <span className="min-w-0 flex-1 break-all font-mono text-xs">{asset.contractAddress}</span>
                          <CopyButton value={asset.contractAddress} label="Copy contract address" />
                        </span>
                      </KeyValue>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-navy-500">Compliance modules</p>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {MODULES.map((m) => (
                      <li key={m} className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-600" aria-hidden /> {m}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
