import { useState } from 'react';
import { Ban, CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react';
import { Button, Modal, Spinner } from '../../components/ui';
import { formatInr, formatNumber, shortHash, formatBlock } from '../../format';
import { PRIYA_ID } from '../../seed';
import { useStore } from '../../store';
import type { Asset, LedgerEvent } from '../../types';

type Step = 'form' | 'checking' | 'done';

export function TransferFlow({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const { state, transfer, openTx } = useStore();
  const recipients = state.investors.filter((i) => i.id !== PRIYA_ID);
  const [recipientId, setRecipientId] = useState(recipients[0]?.id ?? '');
  const held = state.holdings.find((h) => h.investorId === PRIYA_ID && h.assetId === asset.id)?.tokens ?? 0;
  const [raw, setRaw] = useState('1');
  const [step, setStep] = useState<Step>('form');
  const [result, setResult] = useState<LedgerEvent | null>(null);
  const [error, setError] = useState('');

  const tokens = Number(raw) || 0;
  const recipient = recipients.find((r) => r.id === recipientId);
  const invalid = tokens < 1 ? 'Enter at least 1 token.' : tokens > held ? `You hold ${formatNumber(held)} tokens.` : '';

  const send = async () => {
    setStep('checking');
    setError('');
    try {
      const ev = await transfer(asset.id, recipientId, tokens);
      setResult(ev);
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transfer failed');
      setStep('form');
    }
  };

  const blocked = result?.status === 'BLOCKED';

  return (
    <Modal open onClose={onClose} title={`Transfer ${asset.symbol}`} dismissable={step !== 'checking'}>
      {step === 'form' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="transfer-to" className="text-sm font-medium text-ink-800">
              Recipient
            </label>
            <select
              id="transfer-to"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-ink-900"
              data-autofocus
            >
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {shortHash(r.wallet, 4, 4)}
                </option>
              ))}
            </select>
            {recipient && <p className="mt-1 break-all font-mono text-[11px] text-ink-500">{recipient.wallet}</p>}
          </div>
          <div>
            <label htmlFor="transfer-qty" className="text-sm font-medium text-ink-800">
              Tokens
            </label>
            <input
              id="transfer-qty"
              inputMode="numeric"
              value={raw}
              onChange={(e) => setRaw(e.target.value.replace(/[^\d]/g, '').slice(0, 9))}
              className="mt-1.5 h-11 w-full rounded-xl border border-ink-200 px-3 text-ink-900"
              aria-describedby="transfer-hint"
            />
            <p id="transfer-hint" className="mt-1 text-xs text-ink-500">
              Available: {formatNumber(held)} {asset.symbol} · value {formatInr(tokens * asset.pricePerToken)}
            </p>
          </div>
          {(invalid || error) && (
            <p role="alert" className="text-sm text-red-700">
              {error || invalid}
            </p>
          )}
          <p className="flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-hidden />
            Transfers are checked by the token contract itself. Both wallets must be verified in the OUSIA identity registry.
          </p>
          <Button size="lg" className="w-full" disabled={!!invalid} onClick={send}>
            Send {tokens > 0 ? formatNumber(tokens) : ''} {asset.symbol}
          </Button>
        </div>
      )}

      {step === 'checking' && (
        <div className="flex flex-col items-center py-8 text-center" role="status">
          <Spinner className="h-12 w-12 text-ink-500" />
          <p className="mt-4 text-lg font-semibold text-ink-950">Checking transfer rules on-chain…</p>
          <p className="mt-1 text-sm text-ink-500">Identity registry · country restrictions · wallet screening</p>
        </div>
      )}

      {step === 'done' && result && (
        <div className="space-y-4">
          {blocked ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <Ban className="animate-pop mt-0.5 h-6 w-6 shrink-0 text-red-600" aria-hidden />
                <div>
                  <p className="font-semibold text-red-800">Transfer blocked</p>
                  <p className="mt-1 text-sm text-red-800">{result.memo}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-red-700">
                {recipient?.name} is not verified in the identity registry. No tokens left your wallet. The attempt has been recorded in the audit log.
              </p>
            </div>
          ) : (
            <div role="status" className="rounded-2xl border border-accent-100 bg-accent-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="animate-pop mt-0.5 h-6 w-6 shrink-0 text-accent-600" aria-hidden />
                <div>
                  <p className="font-semibold text-accent-700">Transfer settled</p>
                  <p className="mt-1 text-sm text-ink-800">
                    {formatNumber(result.tokens ?? 0)} {asset.symbol} sent to {recipient?.name}. All compliance checks passed, settled in {(result.durationMs / 1000).toFixed(1)}s.
                  </p>
                </div>
              </div>
            </div>
          )}
          <dl className="flex justify-between gap-3 rounded-xl bg-ink-50 p-3 text-sm">
            <div className="min-w-0">
              <dt className="text-xs text-ink-500">Tx hash</dt>
              <dd className="truncate font-mono text-ink-900">{shortHash(result.txHash, 10, 8)}</dd>
            </div>
            <div className="text-right">
              <dt className="text-xs text-ink-500">Block</dt>
              <dd className="font-mono text-ink-900">{formatBlock(result.block)}</dd>
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
            <Button onClick={onClose} data-autofocus>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
