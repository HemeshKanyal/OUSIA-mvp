import { useState } from 'react';
import { ArrowLeft, BadgeCheck, CheckCircle2 } from 'lucide-react';
import { AssetArt } from '../../components/AssetArt';
import { DocumentList } from '../../components/Documents';
import { Button, Card, CompliantBadge, CopyButton, Flag, KeyValue, ProgressBar, SectionTitle, StatusBadge } from '../../components/ui';
import { JURISDICTION_LABEL, formatCr, formatInr, formatNumber, fxLine, shortHash } from '../../format';
import { useStore } from '../../store';
import type { Asset } from '../../types';
import { InvestFlow } from './InvestFlow';

export function AssetDetail({ asset }: { asset: Asset }) {
  const { setUi, priya, state } = useStore();
  const [investing, setInvesting] = useState(false);
  const available = asset.totalTokens - asset.tokensSold;
  const funded = (asset.tokensSold / asset.totalTokens) * 100;
  const fx = fxLine(asset, asset.pricePerToken);
  const lrs = asset.country === 'AE' ? 'India LRS route (overseas investment)' : 'India LRS route';
  const held = state.holdings.find((h) => h.investorId === priya.id && h.assetId === asset.id)?.tokens ?? 0;

  return (
    <div>
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" icon={<ArrowLeft className="h-4 w-4" aria-hidden />} onClick={() => setUi({ investorAssetId: null })}>
        Back
      </Button>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <AssetArt asset={asset} className="h-32 p-5 md:h-40 md:p-6">
              <div className="flex max-w-[55%] flex-wrap items-center gap-2">
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/15 backdrop-blur">{asset.assetClass}</span>
                <StatusBadge status={asset.status} />
                <CompliantBadge />
              </div>
            </AssetArt>
            <div className="p-5 md:p-6">
            <h1 className="text-xl font-semibold tracking-tight text-ink-950 md:text-2xl">{asset.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
              <Flag country={asset.country} />
              {asset.location} · {JURISDICTION_LABEL[asset.jurisdiction]}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-ink-500">Price per token</p>
                <p className="text-lg font-semibold text-ink-950">{formatInr(asset.pricePerToken)}</p>
                {fx && <p className="text-[11px] text-ink-500">{fx}</p>}
              </div>
              <div>
                <p className="text-xs text-ink-500">{asset.yieldLabel}</p>
                <p className="text-lg font-semibold text-ink-950">{asset.yieldPct != null ? `${asset.yieldPct}%` : 'Tracks gold'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500">Min. ticket</p>
                <p className="text-lg font-semibold text-ink-950">{formatInr(asset.minInvestment)}</p>
              </div>
            </div>
            <div className="mt-5 space-y-1.5">
              <ProgressBar value={funded} label="Distribution progress" />
              <p className="flex justify-between text-xs text-ink-500">
                <span>{funded.toFixed(funded < 10 ? 1 : 0)}% distributed</span>
                <span>{formatNumber(asset.investorsCount)} investors</span>
              </p>
            </div>
            </div>
          </Card>

          <Card as="section" className="p-5 md:p-6">
            <SectionTitle>Overview</SectionTitle>
            <p className="text-sm leading-relaxed text-ink-700">{asset.description}</p>
            {asset.highlights.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                {asset.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-800">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card as="section" className="p-5 md:p-6">
            <SectionTitle>Key facts</SectionTitle>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              <KeyValue label="Issuer">{asset.issuer}</KeyValue>
              <KeyValue label="Jurisdiction">{JURISDICTION_LABEL[asset.jurisdiction]}</KeyValue>
              <KeyValue label="Regulator">{asset.regulator}</KeyValue>
              <KeyValue label={asset.yieldLabel}>{asset.yieldPct != null ? `${asset.yieldPct}% p.a.` : 'None, tracks gold price'}</KeyValue>
              <KeyValue label="Tenor">{asset.tenor}</KeyValue>
              <KeyValue label="Tokens available">
                {formatNumber(available)} / {formatNumber(asset.totalTokens)}
              </KeyValue>
              <KeyValue label="Issue size">{formatCr(asset.targetSize)}</KeyValue>
              <KeyValue label="Distribution">{asset.distribution}</KeyValue>
              <KeyValue label="Token">
                <span className="inline-flex items-center gap-1">
                  <span className="font-mono">{shortHash(asset.contractAddress)}</span>
                  <CopyButton value={asset.contractAddress} label="Copy token contract address" />
                </span>
              </KeyValue>
            </dl>
          </Card>

          <Card as="section" className="p-5 md:p-6">
            <SectionTitle>Documents</SectionTitle>
            <DocumentList asset={asset} />
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-0 lg:self-start">
          <Card as="section" className="border-accent-100 p-5">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-accent-600" aria-hidden />
              <h2 className="text-base font-semibold text-ink-950">Eligibility</h2>
            </div>
            <p className="mt-2 text-sm font-medium text-accent-700">You're eligible</p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-600" aria-hidden /> KYC verified
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-600" aria-hidden /> {lrs}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-600" aria-hidden /> Accredited: not required
              </li>
            </ul>
          </Card>

          <Card className="hidden p-5 lg:block">
            <p className="text-xs text-ink-500">Your cash balance</p>
            <p className="text-lg font-semibold text-ink-950">{formatInr(priya.balance)}</p>
            {held > 0 && (
              <p className="mt-1 text-xs text-ink-500">
                You hold {formatNumber(held)} {asset.symbol}
              </p>
            )}
            <Button variant="accent" size="lg" className="mt-4 w-full" onClick={() => setInvesting(true)}>
              Invest
            </Button>
            <p className="mt-2 text-center text-xs text-ink-500">Settles on-chain in ~1.2s, 24x7</p>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 -mb-5 mt-5 border-t border-ink-100 bg-white/95 px-4 py-3 backdrop-blur md:-mx-8 md:-mb-8 md:px-8 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-500">From {formatInr(asset.minInvestment)}</p>
            <p className="truncate text-sm font-semibold text-ink-900">Cash: {formatInr(priya.balance)}</p>
          </div>
          <Button variant="accent" size="lg" onClick={() => setInvesting(true)}>
            Invest
          </Button>
        </div>
      </div>

      <InvestFlow asset={asset} open={investing} onClose={() => setInvesting(false)} />
    </div>
  );
}
