import { ArrowRight } from 'lucide-react';
import { AssetArt } from '../../components/AssetArt';
import { Card, CompliantBadge, Flag, ProgressBar, cx } from '../../components/ui';
import { JURISDICTION_SHORT, formatInr } from '../../format';
import { useStore } from '../../store';
import type { Asset } from '../../types';

export function AssetCard({ asset, highlight }: { asset: Asset; highlight?: boolean }) {
  const { setUi } = useStore();
  const funded = (asset.tokensSold / asset.totalTokens) * 100;
  return (
    <Card as="article" className={cx('group flex flex-col transition-shadow hover:shadow-md', highlight && 'ring-2 ring-brass-400')}>
      <button
        type="button"
        onClick={() => setUi({ investorAssetId: asset.id })}
        className="flex flex-1 flex-col overflow-hidden rounded-2xl text-left"
        aria-label={`${asset.name}, view details`}
      >
        <AssetArt asset={asset} className="h-28 w-full p-4 md:p-5">
          <div className="flex flex-col items-start gap-2">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/15 backdrop-blur">{asset.assetClass}</span>
            <CompliantBadge />
          </div>
        </AssetArt>
        <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="text-base font-semibold leading-snug text-ink-950">{asset.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
          <Flag country={asset.country} />
          {asset.location} · {JURISDICTION_SHORT[asset.jurisdiction]}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-ink-500">{asset.yieldLabel}</dt>
            <dd className="text-lg font-semibold text-ink-950">{asset.yieldPct != null ? `${asset.yieldPct}%` : 'Gold price'}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Min. ticket</dt>
            <dd className="text-lg font-semibold text-ink-950">{formatInr(asset.minInvestment)}</dd>
          </div>
        </dl>
        <div className="mt-4 space-y-1.5">
          <ProgressBar value={funded} label={`${asset.name} distribution progress`} />
          <p className="flex justify-between text-xs text-ink-500">
            <span>{funded < 0.1 && funded > 0 ? '<0.1' : funded.toFixed(funded < 10 ? 1 : 0)}% distributed</span>
            <span className="inline-flex items-center gap-1 font-medium text-ink-800 group-hover:text-accent-700">
              View <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </p>
        </div>
        </div>
      </button>
    </Card>
  );
}
