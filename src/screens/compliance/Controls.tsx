import { useState } from 'react';
import { AlertTriangle, Eye, FileClock, Fingerprint, Lock, Radar, ScanSearch, UserCheck } from 'lucide-react';
import { Card, Toggle, cx } from '../../components/ui';
import { formatNumber } from '../../format';
import { CONTROL_LABEL, LOCKED_CONTROLS, complianceMetrics, useStore } from '../../store';
import type { ControlKey } from '../../types';

const META: Record<ControlKey, { icon: typeof Lock; body: string }> = {
  kycAml: { icon: Fingerprint, body: 'Identity registry claims checked on every mint, investment and transfer.' },
  investorEligibility: { icon: UserCheck, body: 'Residency route (LRS), investor category and per-investor limits.' },
  issuerEligibility: { icon: Eye, body: 'Issuer licence, legal opinion and document checks before approval.' },
  txMonitoring: { icon: Radar, body: 'Velocity, structuring and unusual-pattern alerts on settlement flows.' },
  walletScreening: { icon: ScanSearch, body: 'Sanctions and risk screening of every wallet before it can hold tokens.' },
  auditTrail: { icon: FileClock, body: 'Append-only, hash-chained log of every event, exportable for regulators.' },
};

export function Controls() {
  const { state, toggleControl, toast } = useStore();
  const [busy, setBusy] = useState<ControlKey | null>(null);
  const m = complianceMetrics(state, state.ui.jurisdictionFilter);

  const stats: Record<ControlKey, string> = {
    kycAml: `${formatNumber(m.investors)} verified identities`,
    investorEligibility: 'LRS and per-investor limits active',
    issuerEligibility: `${state.assets.filter((a) => a.status === 'LIVE').length} approved issuances live`,
    txMonitoring: `${formatNumber(m.alerts)} open alerts`,
    walletScreening: `${formatNumber(m.blocked)} transfers blocked`,
    auditTrail: `${formatNumber(state.ledger.length)} events recorded`,
  };

  const anyOff = (Object.keys(state.controls) as ControlKey[]).some((k) => !state.controls[k]);

  return (
    <>
      {anyOff && (
        <p role="status" className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          One or more controls are disabled. The change is recorded in the audit log and would be reported to the regulator.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(CONTROL_LABEL) as ControlKey[]).map((key) => {
          const { icon: Icon, body } = META[key];
          const on = state.controls[key];
          const locked = LOCKED_CONTROLS.includes(key);
          return (
            <Card key={key} as="article" className={cx('flex flex-col p-5', !on && 'border-amber-200')}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <Toggle
                  checked={on}
                  disabled={locked}
                  busy={busy === key}
                  label={`${CONTROL_LABEL[key]}${locked ? ' (mandatory)' : ''}`}
                  onChange={async () => {
                    setBusy(key);
                    try {
                      const ev = await toggleControl(key);
                      if (ev) toast({ tone: 'info', title: ev.memo, body: 'Recorded in the audit trail.', txHash: ev.txHash });
                    } finally {
                      setBusy(null);
                    }
                  }}
                />
              </div>
              <h2 className="mt-3 font-semibold text-navy-950">{CONTROL_LABEL[key]}</h2>
              <p className="mt-1 flex-1 text-sm text-navy-600">{body}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-navy-100 pt-3 text-xs">
                <span className={cx('font-medium', on ? 'text-accent-700' : 'text-amber-800')}>{on ? 'Active' : 'Disabled'}</span>
                <span className="text-navy-500">{stats[key]}</span>
              </div>
              {locked && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-navy-500">
                  <Lock className="h-3 w-3" aria-hidden /> Mandatory under IFSCA and VARA rules, cannot be disabled
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
