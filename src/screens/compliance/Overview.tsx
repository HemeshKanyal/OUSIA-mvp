import { useState } from 'react';
import { AlertTriangle, Building2, Check, ClipboardList, Lock, RotateCcw, ShieldAlert, UserCheck, Users, X } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Hash, SectionTitle, cx } from '../../components/ui';
import { JURISDICTION_LABEL, JURISDICTION_SHORT, formatNumber, timeAgo } from '../../format';
import { complianceMetrics, useStore } from '../../store';
import type { ActionKind, Jurisdiction, PendingAction } from '../../types';
import { Corridor } from './Corridor';
import { RULESETS } from './rules';

const KIND_ICON: Record<ActionKind, typeof Building2> = {
  ASSET_APPROVAL: Building2,
  KYC: UserCheck,
  SANCTIONS: ShieldAlert,
};

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Users; tone: 'ink' | 'amber' | 'red' }) {
  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-ink-600">{label}</p>
        <span
          className={cx(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            tone === 'ink' && 'bg-ink-50 text-ink-700',
            tone === 'amber' && 'bg-amber-50 text-amber-700',
            tone === 'red' && 'bg-red-50 text-red-700',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p key={value} className="animate-fade mt-2 text-2xl font-semibold tracking-tight text-ink-950 md:text-3xl">
        {formatNumber(value)}
      </p>
    </Card>
  );
}

function ActionRow({ action }: { action: PendingAction }) {
  const { resolveAction, reopenAction, toast } = useStore();
  const [busy, setBusy] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const Icon = KIND_ICON[action.kind];
  const pending = action.status === 'PENDING';

  const decide = async (decision: 'APPROVED' | 'REJECTED') => {
    setBusy(decision);
    try {
      const ev = await resolveAction(action.id, decision);
      toast({
        tone: decision === 'APPROVED' ? 'success' : 'info',
        title: `${decision === 'APPROVED' ? 'Approved' : 'Rejected'}: ${action.title.split(':')[0]}`,
        body: ev.memo,
        txHash: ev.txHash,
      });
    } catch (e) {
      toast({ tone: 'error', title: 'Could not record decision', body: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className={cx('flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center md:px-5', !pending && 'bg-ink-50/50')}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-ink-950">{action.title}</p>
          <p className="mt-0.5 text-sm text-ink-600">{action.detail}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <Badge tone={action.priority === 'High' ? 'red' : 'neutral'}>{action.priority}</Badge>
            <span>{JURISDICTION_SHORT[action.jurisdiction]}</span>
            <span>· {pending ? `opened ${timeAgo(action.createdAt)}` : `resolved ${timeAgo(action.resolvedAt ?? Date.now())}`}</span>
            {action.txHash && (
              <span>
                · <Hash hash={action.txHash} />
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:justify-end">
        {pending ? (
          <>
            <Button variant="danger" size="sm" loading={busy === 'REJECTED'} disabled={!!busy} icon={<X className="h-4 w-4" aria-hidden />} onClick={() => decide('REJECTED')} className="flex-1 sm:flex-none">
              Reject
            </Button>
            <Button variant="accent" size="sm" loading={busy === 'APPROVED'} disabled={!!busy} icon={<Check className="h-4 w-4" aria-hidden />} onClick={() => decide('APPROVED')} className="flex-1 sm:flex-none">
              {busy === 'APPROVED' ? 'Recording…' : 'Approve'}
            </Button>
          </>
        ) : (
          <>
            <Badge tone={action.status === 'APPROVED' ? 'green' : 'red'}>{action.status === 'APPROVED' ? 'Approved' : 'Rejected'}</Badge>
            {action.status === 'REJECTED' && (
              <Button variant="ghost" size="sm" icon={<RotateCcw className="h-4 w-4" aria-hidden />} onClick={() => reopenAction(action.id)}>
                Reopen
              </Button>
            )}
          </>
        )}
      </div>
    </li>
  );
}

function RuleSet({ jur }: { jur: Jurisdiction }) {
  const rs = RULESETS[jur];
  return (
    <div>
      <p className="text-sm font-semibold text-ink-950">{JURISDICTION_LABEL[jur]}</p>
      <p className="text-xs text-ink-500">
        {rs.regulator} · {rs.currency}
      </p>
      <ul className="mt-3 space-y-2">
        {rs.rules.map((r) => (
          <li key={r.title} className="rounded-xl border border-ink-100 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink-900">{r.title}</p>
              {r.onChain ? (
                <Badge tone="green">
                  <Lock className="h-3 w-3" aria-hidden /> Enforced on-chain
                </Badge>
              ) : (
                <Badge tone="neutral">Operational</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-600">{r.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Overview() {
  const { state } = useStore();
  const jur = state.ui.jurisdictionFilter;
  const m = complianceMetrics(state, jur);
  const actions = state.actions
    .filter((a) => jur === 'ALL' || a.jurisdiction === jur)
    .sort((a, b) => Number(b.status === 'PENDING') - Number(a.status === 'PENDING') || b.createdAt - a.createdAt);
  const jurs: Jurisdiction[] = jur === 'ALL' ? ['GIFT_IFSC', 'VARA', 'ADGM'] : [jur];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Kpi label="Investors" value={m.investors} icon={Users} tone="ink" />
        <Kpi label="Pending reviews" value={m.pendingReviews} icon={ClipboardList} tone="amber" />
        <Kpi label="Alerts" value={m.alerts} icon={AlertTriangle} tone="red" />
        <Kpi label="Blocked transfers" value={m.blocked} icon={ShieldAlert} tone="red" />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
        <Card as="section" className="overflow-hidden">
          <div className="border-b border-ink-100 px-4 pt-4 md:px-5">
            <SectionTitle>Pending actions</SectionTitle>
          </div>
          {actions.length === 0 ? (
            <EmptyState icon={<ClipboardList className="h-5 w-5" aria-hidden />} title="Nothing needs your attention here" body="No escalated items for this jurisdiction." />
          ) : (
            <ul className="divide-y divide-ink-100">
              {actions.map((a) => (
                <ActionRow key={a.id} action={a} />
              ))}
            </ul>
          )}
          <p className="border-t border-ink-100 px-4 py-3 text-xs text-ink-500 md:px-5">
            + {formatNumber(m.backgroundReviews)} routine reviews in the queue, auto-screened and within SLA.
          </p>
        </Card>
        <Corridor />
        </div>

        <Card as="section" className="p-4 md:p-5">
          <SectionTitle>Rule set</SectionTitle>
          <div className="space-y-6">
            {jurs.map((j) => (
              <RuleSet key={j} jur={j} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
