import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, ExternalLink, Zap } from 'lucide-react';
import { wait } from '../../chain';
import { Button, CopyButton, Modal, Spinner, cx } from '../../components/ui';
import { FX, formatInr, formatNumber, fxLine, formatBlock } from '../../format';
import { useStore } from '../../store';
import type { Asset, LedgerEvent } from '../../types';

type Step = 'amount' | 'checks' | 'confirm' | 'settling' | 'success' | 'error';

interface Check {
  label: string;
  detail: string;
  skipped?: boolean;
}

const LRS_LIMIT_INR = 250_000 * FX.USD;
const STEP_LABELS = ['Amount', 'Eligibility', 'Confirm', 'Settle'];

export function InvestFlow({ asset, open, onClose }: { asset: Asset; open: boolean; onClose: () => void }) {
  const { priya, invest, state, openTx, toast, addFunds, setUi } = useStore();
  const [step, setStep] = useState<Step>('amount');
  const [raw, setRaw] = useState('5000');
  const [passed, setPassed] = useState(0);
  const [result, setResult] = useState<LedgerEvent | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStep('amount');
      setRaw(String(Math.max(asset.minInvestment, 5000)));
      setPassed(0);
      setResult(null);
      setError('');
    }
  }, [open, asset.minInvestment]);

  const amountIn = Number(raw.replace(/[^\d]/g, '')) || 0;
  const tokens = Math.floor(amountIn / asset.pricePerToken);
  const amount = tokens * asset.pricePerToken;
  const available = asset.totalTokens - asset.tokensSold;
  const invested = state.ledger.filter((e) => e.type === 'INVEST' && e.to === priya.wallet).reduce((n, e) => n + (e.amountInr ?? 0), 0);

  let validation = '';
  if (amountIn > 0 && amountIn < asset.minInvestment) validation = `Minimum investment is ${formatInr(asset.minInvestment)}.`;
  else if (tokens < 1 && amountIn > 0) validation = `Enter at least ${formatInr(asset.pricePerToken)} for one token.`;
  else if (amount > priya.balance) validation = `Amount exceeds your cash balance of ${formatInr(priya.balance)}.`;
  else if (tokens > available) validation = `Only ${formatNumber(available)} tokens are available.`;
  const canContinue = tokens >= 1 && !validation;

  const checks: Check[] = [
    { label: 'KYC', detail: 'Verified · PAN, Aadhaar e-KYC, video KYC' },
    state.controls.walletScreening
      ? { label: 'Sanctions screening', detail: 'No match · OFAC, UN, EU and UAE lists' }
      : { label: 'Sanctions screening', detail: 'Skipped: wallet screening disabled by Compliance', skipped: true },
    state.controls.investorEligibility
      ? {
          label: 'Jurisdiction rule',
          detail:
            asset.country === 'AE'
              ? 'India resident → UAE asset via LRS (overseas investment) · permitted'
              : 'India resident → GIFT IFSC asset via LRS route · permitted',
        }
      : { label: 'Jurisdiction rule', detail: 'Skipped: investor eligibility disabled by Compliance', skipped: true },
    state.controls.investorEligibility
      ? {
          label: 'Investor limit',
          detail: `${formatInr(invested + amount)} of ${formatInr(LRS_LIMIT_INR)} LRS limit this FY${asset.jurisdiction === 'VARA' ? ' · within VARA per-investor cap' : ''}`,
        }
      : { label: 'Investor limit', detail: 'Skipped: investor eligibility disabled by Compliance', skipped: true },
  ];

  useEffect(() => {
    if (step !== 'checks') return;
    let cancelled = false;
    (async () => {
      for (let i = 1; i <= checks.length; i++) {
        await wait(450);
        if (cancelled) return;
        setPassed(i);
      }
    })();
    return () => {
      cancelled = true;
    };
    // checks length is constant; run once per entry into this step
  }, [step]);

  const settle = async () => {
    setStep('settling');
    try {
      const ev = await invest(asset.id, tokens);
      setResult(ev);
      setStep('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Settlement failed');
      setStep('error');
    }
  };

  const stepIndex = { amount: 0, checks: 1, confirm: 2, settling: 3, success: 3, error: 3 }[step];
  const fx = fxLine(asset, amount);

  return (
    <Modal open={open} onClose={onClose} title={step === 'success' ? 'Investment settled' : `Invest in ${asset.name}`} dismissable={step !== 'settling'}>
      {step !== 'success' && (
        <ol className="mb-5 flex gap-1.5" aria-label="Progress">
          {STEP_LABELS.map((label, i) => (
            <li key={label} className="flex-1">
              <div className={cx('h-1 rounded-full', i <= stepIndex ? 'bg-accent-500' : 'bg-navy-100')} />
              <p className={cx('mt-1 text-[11px]', i === stepIndex ? 'font-semibold text-navy-900' : 'text-navy-500')} aria-current={i === stepIndex ? 'step' : undefined}>
                {label}
              </p>
            </li>
          ))}
        </ol>
      )}

      {step === 'amount' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="invest-amount" className="text-sm font-medium text-navy-800">
              Amount (INR)
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-navy-200 px-3 focus-within:border-accent-600 focus-within:ring-2 focus-within:ring-accent-100">
              <span className="text-lg font-semibold text-navy-500">₹</span>
              <input
                id="invest-amount"
                data-autofocus
                inputMode="numeric"
                autoComplete="off"
                value={raw ? Number(raw.replace(/[^\d]/g, '') || 0).toLocaleString('en-IN') : ''}
                onChange={(e) => setRaw(e.target.value.replace(/[^\d]/g, '').slice(0, 9))}
                className="h-12 w-full bg-transparent px-2 text-xl font-semibold text-navy-950 outline-none"
                aria-describedby="invest-hint"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[asset.minInvestment, 5000, 10000, 25000]
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setRaw(String(v))}
                    className="h-8 rounded-full px-3 text-xs font-medium text-navy-700 ring-1 ring-inset ring-navy-200 hover:bg-navy-50"
                  >
                    {formatInr(v)}
                  </button>
                ))}
            </div>
          </div>

          <div id="invest-hint" className="rounded-xl bg-navy-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-600">Tokens</span>
              <span className="font-semibold text-navy-950">
                {formatNumber(tokens)} {asset.symbol}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-navy-600">Price per token</span>
              <span className="text-navy-900">{formatInr(asset.pricePerToken)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-navy-600">You invest</span>
              <span className="text-right font-semibold text-navy-950">
                {formatInr(amount)}
                {fx && <span className="block text-[11px] font-normal text-navy-500">{fx}</span>}
              </span>
            </div>
            {amount !== amountIn && tokens > 0 && <p className="mt-2 text-xs text-navy-500">Rounded down to whole tokens.</p>}
          </div>

          {validation && (
            <p role="alert" className="flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                {validation}{' '}
                {amount > priya.balance && (
                  <button type="button" className="font-medium underline" onClick={() => addFunds(25_000)}>
                    Add ₹25,000
                  </button>
                )}
              </span>
            </p>
          )}

          <Button size="lg" className="w-full" disabled={!canContinue} onClick={() => setStep('checks')}>
            Check eligibility
          </Button>
        </div>
      )}

      {step === 'checks' && (
        <div className="space-y-4">
          <p className="text-sm text-navy-600">Running the compliance rule engine for this investment…</p>
          <ul className="space-y-2">
            {checks.map((c, i) => {
              const done = i < passed;
              const running = i === passed;
              return (
                <li key={c.label} className={cx('flex items-start gap-3 rounded-xl border p-3 transition-colors', done ? (c.skipped ? 'border-amber-200 bg-amber-50' : 'border-accent-100 bg-accent-50/60') : 'border-navy-100')}>
                  <span className="mt-0.5">
                    {done ? (
                      c.skipped ? (
                        <AlertTriangle className="animate-pop h-5 w-5 text-amber-600" aria-label="Skipped" />
                      ) : (
                        <CheckCircle2 className="animate-pop h-5 w-5 text-accent-600" aria-label="Passed" />
                      )
                    ) : running ? (
                      <Spinner className="h-5 w-5 text-navy-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-navy-200" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-navy-900">
                      {c.label} {done && !c.skipped && '✓'}
                    </span>
                    <span className="block text-xs text-navy-500">{done || running ? c.detail : 'Waiting'}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <Button size="lg" className="w-full" disabled={passed < checks.length} onClick={() => setStep('confirm')}>
            {passed < checks.length ? 'Checking…' : 'All checks passed: continue'}
          </Button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <dl className="divide-y divide-navy-100 rounded-xl border border-navy-100 text-sm">
            {[
              ['Asset', asset.name],
              ['Tokens', `${formatNumber(tokens)} ${asset.symbol}`],
              ['Amount', formatInr(amount)],
              ['Settlement fee', '₹0 (demo)'],
              ['Settlement', 'Atomic DvP · T+0 · 24x7'],
              ['Cash after', formatInr(priya.balance - amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-navy-600">{k}</dt>
                <dd className="text-right font-medium text-navy-950">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-navy-500">By confirming you agree to the offering terms. Tokens are delivered to your wallet and cash is debited in the same transaction.</p>
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep('amount')}>
              Edit
            </Button>
            <Button variant="accent" size="lg" className="flex-[2]" onClick={settle} data-autofocus>
              Confirm {formatInr(amount)}
            </Button>
          </div>
        </div>
      )}

      {step === 'settling' && (
        <div className="flex flex-col items-center py-8 text-center" role="status">
          <Spinner className="h-12 w-12 text-accent-600" />
          <p className="mt-4 text-lg font-semibold text-navy-950">Settling on-chain…</p>
          <p className="mt-1 text-sm text-navy-500">Delivery versus payment: cash and tokens move together, or not at all.</p>
        </div>
      )}

      {step === 'error' && (
        <div className="space-y-4 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-600" aria-hidden />
          <p role="alert" className="text-sm text-red-700">
            {error}. Nothing was debited.
          </p>
          <Button className="w-full" onClick={() => setStep('amount')}>
            Try again
          </Button>
        </div>
      )}

      {step === 'success' && result && (
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-accent-50">
              <CheckCircle2 className="h-9 w-9 text-accent-600" aria-hidden />
            </div>
            <p className="mt-3 text-2xl font-semibold text-navy-950">{formatInr(result.amountInr ?? 0)}</p>
            <p className="text-sm text-navy-600">
              {formatNumber(result.tokens ?? 0)} {asset.symbol} delivered to your wallet
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1 text-xs font-medium text-white">
              <Zap className="h-3.5 w-3.5 text-accent-500" aria-hidden />
              Settled in {(result.durationMs / 1000).toFixed(1)}s · 24x7
            </p>
          </div>
          <dl className="space-y-3 rounded-xl bg-navy-50 p-4 text-sm">
            <div>
              <dt className="text-xs text-navy-500">Transaction hash</dt>
              <dd className="mt-0.5 flex items-start gap-1">
                <span className="min-w-0 flex-1 break-all font-mono text-xs text-navy-900">{result.txHash}</span>
                <CopyButton value={result.txHash} label="Copy transaction hash" />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-600">Block</dt>
              <dd className="font-mono font-medium text-navy-950">{formatBlock(result.block)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-600">Status</dt>
              <dd className="font-medium text-accent-700">Confirmed</dd>
            </div>
          </dl>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              icon={<ExternalLink className="h-4 w-4" aria-hidden />}
              onClick={() => {
                onClose();
                openTx(result.txHash);
              }}
            >
              View on OUSIA Explorer
            </Button>
            <Button
              data-autofocus
              onClick={() => {
                onClose();
                setUi({ investorAssetId: null, investorTab: 'holdings' });
                toast({ tone: 'success', title: 'Added to holdings', body: `${formatNumber(result.tokens ?? 0)} ${asset.symbol}`, txHash: result.txHash });
              }}
            >
              View holdings
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
