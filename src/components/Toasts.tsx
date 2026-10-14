import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { Hash, cx } from './ui';

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? XCircle : Info;
        return (
          <div key={t.id} className="animate-fade pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-navy-100 bg-white p-3 shadow-lg">
            <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', t.tone === 'success' ? 'text-accent-600' : t.tone === 'error' ? 'text-red-600' : 'text-sky-700')} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy-950">{t.title}</p>
              {t.body && <p className="mt-0.5 break-words text-sm text-navy-600">{t.body}</p>}
              {t.txHash && (
                <p className="mt-1 text-xs text-navy-500">
                  Tx <Hash hash={t.txHash} />
                </p>
              )}
            </div>
            <button type="button" onClick={() => dismissToast(t.id)} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-navy-500 hover:bg-navy-100" aria-label="Dismiss">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
