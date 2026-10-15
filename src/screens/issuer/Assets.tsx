import { useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Clock, ExternalLink, Plus, Rocket, Scale, Upload, XCircle } from 'lucide-react';
import { DocumentList } from '../../components/Documents';
import { Badge, Button, Card, Flag, Hash, Modal, PageHeader, SectionTitle, StatusBadge } from '../../components/ui';
import { JURISDICTION_LABEL, JURISDICTION_SHORT, formatCr, formatInr, formatNumber, formatBlock } from '../../format';
import { useStore } from '../../store';
import type { Asset, AssetClass, Jurisdiction } from '../../types';
import { AssetPicker } from './AssetPicker';
import { IssuanceStepper } from './Stepper';
import { useIssuerAssets } from './useIssuerAssets';

export function IssuerAssets() {
  const { selected } = useIssuerAssets();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Issuer portal"
        subtitle="ABC Capital · IFSCA registered issuer"
        action={
          <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setCreating(true)}>
            New asset
          </Button>
        }
      />

      <AssetPicker />

      {selected && <AssetPanel key={selected.id} asset={selected} />}

      <NewAssetModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

function AssetPanel({ asset }: { asset: Asset }) {
  const raised = asset.tokensSold * asset.pricePerToken;
  const issued = asset.status === 'LIVE' ? asset.totalTokens : 0;
  return (
    <div className="space-y-5">
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-700">{asset.assetClass}</span>
              <StatusBadge status={asset.status} />
            </div>
            <h2 className="mt-2 text-lg font-semibold text-ink-950 md:text-xl">{asset.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
              <Flag country={asset.country} />
              {asset.location} · {JURISDICTION_LABEL[asset.jurisdiction]}
            </p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ['Target', formatCr(asset.targetSize)],
            ['Investors', formatNumber(asset.investorsCount)],
            ['Tokens issued', `${formatNumber(issued)}`],
            ['Raised', formatInr(raised)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-ink-50 p-3">
              <dt className="text-xs text-ink-500">{k}</dt>
              <dd className="mt-0.5 text-lg font-semibold text-ink-950">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card as="section" className="p-5 md:p-6">
        <SectionTitle>Issuance workflow</SectionTitle>
        <IssuanceStepper asset={asset} />
        <div className="mt-6 border-t border-ink-100 pt-5">
          <StageAction asset={asset} />
        </div>
      </Card>

      <Card as="section" className="p-5 md:p-6">
        <SectionTitle action={<UploadButton asset={asset} />}>Documents</SectionTitle>
        <DocumentList asset={asset} />
      </Card>
    </div>
  );
}

function StageAction({ asset }: { asset: Asset }) {
  const { state, completeLegal, issueTokens, reopenAction, setUi, toast } = useStore();
  const [busy, setBusy] = useState(false);
  const mint = [...state.ledger].reverse().find((e) => e.assetId === asset.id && e.type === 'MINT');
  const action = state.actions.find((a) => a.kind === 'ASSET_APPROVAL' && a.refId === asset.id);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast({ tone: 'error', title: 'Action failed', body: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  if (asset.status === 'SUBMITTED') {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-ink-700">
          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-hidden />
          Legal counsel is verifying title and the SPV structure.
        </p>
        <Button
          loading={busy}
          onClick={() =>
            run(async () => {
              const ev = await completeLegal(asset.id);
              toast({ tone: 'success', title: 'Legal verification complete', body: 'Sent to OUSIA Compliance for review.', txHash: ev.txHash });
            })
          }
        >
          {busy ? 'Anchoring legal opinion…' : 'Record legal opinion'}
        </Button>
      </div>
    );
  }

  if (asset.status === 'IN_REVIEW') {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-ink-700">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          Awaiting OUSIA Compliance review. Token issuance unlocks once the asset is approved.
        </p>
        <Button variant="secondary" icon={<ExternalLink className="h-4 w-4" aria-hidden />} onClick={() => setUi({ role: 'compliance', complianceTab: 'overview' })}>
          Open compliance console
        </Button>
      </div>
    );
  }

  if (asset.status === 'REJECTED') {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-red-700">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Compliance rejected this application. Address the comments and resubmit.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            if (action) reopenAction(action.id);
            toast({ tone: 'info', title: 'Resubmitted for compliance review' });
          }}
        >
          Resubmit for review
        </Button>
      </div>
    );
  }

  if (asset.status === 'APPROVED') {
    return (
      <div className="animate-fade flex flex-col gap-3 rounded-2xl bg-accent-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-accent-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Approved by OUSIA Compliance.</strong> Ready to mint {formatNumber(asset.totalTokens)} {asset.symbol} tokens.
          </span>
        </p>
        <Button
          variant="accent"
          size="lg"
          loading={busy}
          icon={<Rocket className="h-4 w-4" aria-hidden />}
          onClick={() =>
            run(async () => {
              const ev = await issueTokens(asset.id);
              toast({
                tone: 'success',
                title: `${formatNumber(asset.totalTokens)} ${asset.symbol} minted`,
                body: `${asset.name} is now live for investors.`,
                txHash: ev.txHash,
              });
            })
          }
        >
          {busy ? `Minting ${formatNumber(asset.totalTokens)} tokens…` : 'Issue tokens'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-ink-700">
        <p className="flex items-center gap-2 font-medium text-accent-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> Live · distribution open to eligible investors
        </p>
        {mint && (
          <p className="mt-1 text-xs text-ink-500">
            {formatNumber(mint.tokens ?? 0)} {asset.symbol} minted · tx <Hash hash={mint.txHash} /> · block {formatBlock(mint.block)}
          </p>
        )}
      </div>
      <Button variant="secondary" icon={<ExternalLink className="h-4 w-4" aria-hidden />} onClick={() => setUi({ role: 'investor', investorTab: 'explore', investorAssetId: null })}>
        See it in Explore
      </Button>
    </div>
  );
}

const MOCK_FILES = ['Independent Valuation Report.pdf', 'Fire & Safety NOC.pdf', 'Rent Roll Q3.pdf', 'Board Resolution.pdf', 'Insurance Certificate.pdf'];

function UploadButton({ asset }: { asset: Asset }) {
  const { uploadDoc, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = async (name: string) => {
    setBusy(name);
    try {
      const ev = await uploadDoc(asset.id, name);
      toast({ tone: 'success', title: 'Document added', body: `${name} hash anchored on-chain.`, txHash: ev.txHash });
      setOpen(false);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Button variant="secondary" size="sm" icon={<Upload className="h-4 w-4" aria-hidden />} onClick={() => setOpen(true)}>
        Upload
      </Button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Upload document" dismissable={!busy}>
        <p className="text-sm text-ink-600">Demo mode: only the file name is recorded and its hash is anchored on-chain. File contents never leave your device.</p>
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void add(f.name);
            e.target.value = '';
          }}
        />
        <Button className="mt-4 w-full" variant="secondary" disabled={!!busy} onClick={() => fileRef.current?.click()} icon={<Upload className="h-4 w-4" aria-hidden />} data-autofocus>
          Choose a file from this device
        </Button>
        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-500">Or add a sample document</p>
        <ul className="mt-2 space-y-2">
          {MOCK_FILES.filter((n) => !asset.documents.some((d) => d.name === n)).map((name) => (
            <li key={name}>
              <Button variant="ghost" className="w-full justify-start" loading={busy === name} disabled={!!busy && busy !== name} onClick={() => add(name)}>
                {name}
              </Button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

const CLASSES: AssetClass[] = ['Real Estate', 'Bond', 'Gold', 'T-Bill'];
const JURS: Jurisdiction[] = ['GIFT_IFSC', 'VARA', 'ADGM'];

function NewAssetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { submitAsset, toast } = useStore();
  const [name, setName] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('Real Estate');
  const [jur, setJur] = useState<Jurisdiction>('GIFT_IFSC');
  const [size, setSize] = useState('25');
  const [yieldPct, setYieldPct] = useState('7.0');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);

  const sizeNum = Number(size);
  const nameError = name.trim().length < 3 ? 'Enter an asset name (at least 3 characters).' : '';
  const sizeError = !(sizeNum > 0 && sizeNum <= 5000) ? 'Enter a size between ₹0.01 Cr and ₹5,000 Cr.' : '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (nameError || sizeError) return;
    setBusy(true);
    try {
      const asset = await submitAsset({
        name,
        assetClass,
        jurisdiction: jur,
        sizeCr: sizeNum,
        yieldPct: assetClass === 'Gold' ? null : Number(yieldPct) || null,
      });
      toast({ tone: 'success', title: 'Asset submitted', body: `${asset.name} is now in legal verification.` });
      setName('');
      setTouched(false);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const field = 'mt-1.5 h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-ink-900';
  return (
    <Modal open={open} onClose={onClose} title="New asset" dismissable={!busy}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="na-name" className="text-sm font-medium text-ink-800">
            Asset name
          </label>
          <input
            id="na-name"
            data-autofocus
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pune Logistics Park, Chakan"
            aria-invalid={touched && !!nameError}
            aria-describedby="na-name-err"
          />
          {touched && nameError && (
            <p id="na-name-err" className="mt-1 text-xs text-red-700">
              {nameError}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="na-class" className="text-sm font-medium text-ink-800">
              Asset class
            </label>
            <select id="na-class" className={field} value={assetClass} onChange={(e) => setAssetClass(e.target.value as AssetClass)}>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="na-jur" className="text-sm font-medium text-ink-800">
              Jurisdiction
            </label>
            <select id="na-jur" className={field} value={jur} onChange={(e) => setJur(e.target.value as Jurisdiction)}>
              {JURS.map((j) => (
                <option key={j} value={j}>
                  {JURISDICTION_SHORT[j]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="na-size" className="text-sm font-medium text-ink-800">
              Size (₹ Cr)
            </label>
            <input id="na-size" inputMode="decimal" className={field} value={size} onChange={(e) => setSize(e.target.value.replace(/[^\d.]/g, ''))} aria-invalid={touched && !!sizeError} aria-describedby="na-size-err" />
          </div>
          <div>
            <label htmlFor="na-yield" className="text-sm font-medium text-ink-800">
              Target yield (%)
            </label>
            <input
              id="na-yield"
              inputMode="decimal"
              className={field}
              value={assetClass === 'Gold' ? '' : yieldPct}
              placeholder={assetClass === 'Gold' ? 'n/a' : ''}
              disabled={assetClass === 'Gold'}
              onChange={(e) => setYieldPct(e.target.value.replace(/[^\d.]/g, ''))}
            />
          </div>
        </div>
        {touched && sizeError && (
          <p id="na-size-err" className="text-xs text-red-700">
            {sizeError}
          </p>
        )}
        <p className="rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
          Tokens are priced at ₹1,000. {sizeNum > 0 ? `${formatNumber(Math.round((sizeNum * 1e7) / 1000))} tokens will be minted after approval.` : ''}{' '}
          <Badge tone="neutral">Starts as Submitted</Badge>
        </p>
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          {busy ? 'Submitting…' : 'Submit asset'}
        </Button>
      </form>
    </Modal>
  );
}
