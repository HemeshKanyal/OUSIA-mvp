import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { CheckCircle2, Copy, Loader2, X } from 'lucide-react';
import type { AssetStatus, Country, KycStatus } from '../types';
import { shortHash } from '../format';
import { useStore } from '../store';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'inverse' | 'onDark';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink-900 bg-ink-sheen text-white shadow-sm hover:brightness-125 disabled:bg-ink-300 disabled:[background-image:none]',
  accent: 'bg-brass-600 bg-brass-sheen text-white shadow-sm hover:brightness-110 disabled:bg-ink-300 disabled:[background-image:none]',
  secondary: 'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 disabled:text-ink-300',
  ghost: 'text-ink-700 hover:bg-ink-100 disabled:text-ink-300',
  // For use on black surfaces such as the portfolio card
  inverse: 'bg-white text-ink-900 hover:bg-ink-100',
  onDark: 'bg-white/10 text-white hover:bg-white/20',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50 disabled:text-red-300',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-base',
        VARIANTS[variant],
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function Card({ className, children, as: Tag = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' }) {
  return <Tag className={cx('rounded-2xl border border-ink-100 bg-white shadow-card', className)}>{children}</Tag>;
}

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="text-base font-semibold text-ink-900">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink-950 md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'ink';
const TONES: Record<Tone, string> = {
  neutral: 'bg-ink-50 text-ink-700 ring-ink-200',
  green: 'bg-accent-50 text-accent-700 ring-accent-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-sky-50 text-sky-800 ring-sky-200',
  ink: 'bg-ink-gradient text-white ring-ink-900',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_META: Record<AssetStatus, { tone: Tone; label: string }> = {
  SUBMITTED: { tone: 'neutral', label: 'Submitted' },
  IN_REVIEW: { tone: 'amber', label: 'In compliance review' },
  APPROVED: { tone: 'blue', label: 'Approved' },
  LIVE: { tone: 'green', label: 'Live' },
  REJECTED: { tone: 'red', label: 'Rejected' },
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  const m = STATUS_META[status];
  return (
    <Badge tone={m.tone}>
      {status === 'LIVE' && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden />}
      {m.label}
    </Badge>
  );
}

export function KycBadge({ status }: { status: KycStatus }) {
  const tone: Tone = status === 'VERIFIED' ? 'green' : status === 'PENDING' ? 'amber' : 'red';
  return <Badge tone={tone}>KYC {status.toLowerCase()}</Badge>;
}

export function CompliantBadge() {
  return (
    <Badge tone="green">
      <CheckCircle2 className="h-3 w-3" aria-hidden />
      Compliant
    </Badge>
  );
}

/** Small self-drawn flags; emoji flags do not render on Windows. */
export function Flag({ country, className }: { country: Country; className?: string }) {
  const label = country === 'IN' ? 'India' : 'United Arab Emirates';
  return (
    <svg viewBox="0 0 30 20" className={cx('inline-block h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-ink-200', className)} role="img" aria-label={label}>
      {country === 'IN' ? (
        <>
          <rect width="30" height="20" fill="#fff" />
          <rect width="30" height="6.67" fill="#FF9933" />
          <rect y="13.33" width="30" height="6.67" fill="#138808" />
          <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.8" />
        </>
      ) : (
        <>
          <rect width="30" height="20" fill="#fff" />
          <rect width="30" height="6.67" fill="#00732F" />
          <rect y="13.33" width="30" height="6.67" fill="#000" />
          <rect width="8" height="20" fill="#FF0000" />
        </>
      )}
    </svg>
  );
}

export function Hash({ hash, className, linkToTx = true, short }: { hash: string; className?: string; linkToTx?: boolean; short?: boolean }) {
  const { openTx } = useStore();
  const text = <span className="font-mono">{short ? shortHash(hash, 4, 4) : shortHash(hash)}</span>;
  if (!linkToTx) return <span className={cx('text-ink-600', className)}>{text}</span>;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openTx(hash);
      }}
      className={cx('rounded text-sky-800 underline decoration-sky-300 underline-offset-2 hover:text-sky-900', className)}
      aria-label={`Open transaction ${shortHash(hash)} in OUSIA Explorer`}
    >
      {text}
    </button>
  );
}

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const { toast } = useStore();
  return (
    <button
      type="button"
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
      aria-label={label}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          toast({ tone: 'success', title: 'Copied to clipboard' });
        } catch {
          toast({ tone: 'info', title: 'Copy not available', body: value });
        }
      }}
    >
      <Copy className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cx('animate-spin', className)} aria-hidden />;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
      <div className="h-full rounded-full bg-gradient-to-r from-brass-300 to-brass-600 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled, busy }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean; busy?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || busy}
      onClick={onChange}
      className={cx(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed',
        checked ? 'bg-ink-900' : 'bg-ink-300',
        disabled && 'opacity-60',
      )}
    >
      <span className={cx('inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')}>
        {busy && <Spinner className="h-3 w-3 text-ink-500" />}
      </span>
    </button>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 text-ink-500">{icon}</div>
      <p className="font-medium text-ink-900">{title}</p>
      {body && <p className="max-w-sm text-sm text-ink-500">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-colors',
        active ? 'bg-ink-sheen text-white shadow-sm' : 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-ink-50',
      )}
    >
      {children}
    </button>
  );
}

function useDialogFocus(open: boolean, onClose: () => void, dismissable: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const dismissRef = useRef(dismissable);
  dismissRef.current = dismissable;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node;
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissRef.current) closeRef.current();
      if (e.key === 'Tab' && node) {
        const items = Array.from(
          node.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])'),
        );
        if (items.length === 0) return;
        const firstItem = items[0];
        const lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstItem) {
          e.preventDefault();
          lastItem.focus();
        } else if (!e.shiftKey && document.activeElement === lastItem) {
          e.preventDefault();
          firstItem.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open]);
  return ref;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  dismissable = true,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  dismissable?: boolean;
  wide?: boolean;
}) {
  const ref = useDialogFocus(open, onClose, dismissable);
  const titleId = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 md:items-center md:p-6" onMouseDown={(e) => e.target === e.currentTarget && dismissable && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'animate-sheet flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none md:rounded-3xl',
          wide ? 'md:max-w-2xl' : 'md:max-w-md',
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <h2 id={titleId} className="truncate text-base font-semibold text-ink-950">
            {title}
          </h2>
          {dismissable && (
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100" aria-label="Close">
              <X className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useDialogFocus(open, onClose, true);
  const titleId = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-ink-950/40 md:items-stretch" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-sheet flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none md:max-h-none md:max-w-lg md:animate-drawer md:rounded-none"
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <h2 id={titleId} className="truncate text-base font-semibold text-ink-950">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100" aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function KeyValue({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className={cx('mt-0.5 break-words text-sm font-medium text-ink-900', mono && 'font-mono')}>{children}</dd>
    </div>
  );
}
