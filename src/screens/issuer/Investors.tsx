import { Users } from 'lucide-react';
import { Card, EmptyState, KycBadge, PageHeader } from '../../components/ui';
import { formatInr, formatNumber, shortHash } from '../../format';
import { ISSUER_TREASURY } from '../../seed';
import { useStore } from '../../store';
import { AssetPicker } from './AssetPicker';
import { useIssuerAssets } from './useIssuerAssets';

export function capTable(state: ReturnType<typeof useStore>['state'], assetId: string) {
  const asset = state.assets.find((a) => a.id === assetId)!;
  const holders = state.holdings
    .filter((h) => h.assetId === assetId && h.tokens > 0)
    .map((h) => {
      const inv = state.investors.find((i) => i.id === h.investorId)!;
      return { name: inv.name, wallet: inv.wallet, kyc: inv.kyc, tokens: h.tokens };
    })
    .sort((a, b) => b.tokens - a.tokens);
  const unsold = asset.totalTokens - asset.tokensSold;
  return { asset, holders, unsold };
}

export function IssuerInvestors() {
  const { state } = useStore();
  const { selected } = useIssuerAssets();
  if (!selected) return null;
  const { asset, holders, unsold } = capTable(state, selected.id);
  const live = asset.status === 'LIVE';

  return (
    <>
      <PageHeader title="Investors" subtitle={`Cap table for ${asset.name}, read from the on-chain register`} />
      <AssetPicker />
      <Card className="overflow-hidden">
        {!live ? (
          <EmptyState icon={<Users className="h-5 w-5" aria-hidden />} title="No tokens issued yet" body="The cap table populates once tokens are minted and distributed." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Holder</th>
                <th scope="col" className="hidden px-3 py-3 font-medium sm:table-cell">KYC</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Tokens</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {holders.map((h) => (
                <tr key={h.wallet}>
                  <td className="px-4 py-3">
                    <span className="block font-medium text-ink-900">{h.name}</span>
                    <span className="block font-mono text-[11px] text-ink-500">{shortHash(h.wallet, 4, 4)}</span>
                  </td>
                  <td className="hidden px-3 py-3 sm:table-cell">
                    <KycBadge status={h.kyc} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="block text-ink-900">{formatNumber(h.tokens)}</span>
                    <span className="block text-xs text-ink-500">{formatInr(h.tokens * asset.pricePerToken)}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-ink-700">{((h.tokens / asset.totalTokens) * 100).toFixed(4)}%</td>
                </tr>
              ))}
              <tr className="bg-ink-50/60">
                <td className="px-4 py-3">
                  <span className="block font-medium text-ink-900">ABC Capital treasury (undistributed)</span>
                  <span className="block font-mono text-[11px] text-ink-500">{shortHash(ISSUER_TREASURY[asset.issuerId], 4, 4)}</span>
                </td>
                <td className="hidden px-3 py-3 sm:table-cell">
                  <span className="text-xs text-ink-500">Issuer</span>
                </td>
                <td className="px-3 py-3 text-right text-ink-900">{formatNumber(unsold)}</td>
                <td className="px-4 py-3 text-right text-ink-700">{((unsold / asset.totalTokens) * 100).toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        )}
      </Card>
      {live && holders.length === 0 && <p className="mt-3 text-sm text-ink-500">No investors yet. Distribution is open in the investor app.</p>}
    </>
  );
}
