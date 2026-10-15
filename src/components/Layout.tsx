import { useEffect, useState } from 'react';
import { CircleHelp, Info, RotateCcw } from 'lucide-react';
import { currentBlock } from '../chain';
import { formatBlock } from '../format';
import { COMPLIANCE_TABS, INVESTOR_TABS, ISSUER_TABS, ROLE_LABEL, type NavItem } from '../nav';
import { useStore } from '../store';
import type { Role } from '../types';
import { OusiaLogo } from './Logo';
import { Button, KycBadge, Modal, cx } from './ui';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <OusiaLogo className="h-5 w-auto text-ink-900 md:h-6" />
      <span className="hidden border-l border-ink-200 pl-3 text-[10px] font-medium uppercase leading-tight tracking-wider text-ink-500 lg:block">
        Settlement
        <br />
        infrastructure
      </span>
    </div>
  );
}

function useNav() {
  const { state, setUi } = useStore();
  const { ui } = state;
  const items: NavItem[] = ui.role === 'investor' ? INVESTOR_TABS : ui.role === 'issuer' ? ISSUER_TABS : COMPLIANCE_TABS;
  const active = ui.role === 'investor' ? ui.investorTab : ui.role === 'issuer' ? ui.issuerTab : ui.complianceTab;
  const select = (id: string) => {
    if (ui.role === 'investor') setUi({ investorTab: id as typeof ui.investorTab, investorAssetId: null });
    else if (ui.role === 'issuer') setUi({ issuerTab: id as typeof ui.issuerTab });
    else setUi({ complianceTab: id as typeof ui.complianceTab });
  };
  return { items, active, select };
}

function RoleSwitcher({ className }: { className?: string }) {
  const { state, setUi } = useStore();
  const roles: Role[] = ['investor', 'issuer', 'compliance'];
  return (
    <div role="radiogroup" aria-label="Switch role" className={cx('flex rounded-xl bg-ink-100 p-1', className)}>
      {roles.map((r) => {
        const active = state.ui.role === r;
        return (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setUi({ role: r })}
            className={cx(
              'h-8 flex-1 rounded-lg px-3 text-sm font-medium transition-colors md:flex-none md:px-4',
              active ? 'bg-white text-ink-950 shadow-sm' : 'text-ink-600 hover:text-ink-900',
            )}
          >
            {ROLE_LABEL[r]}
          </button>
        );
      })}
    </div>
  );
}

function BlockTicker() {
  const [block, setBlock] = useState(currentBlock);
  useEffect(() => {
    const id = window.setInterval(() => setBlock(currentBlock()), 2000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="hidden items-center gap-2 rounded-full bg-ink-50 px-3 py-1.5 text-xs text-ink-600 ring-1 ring-inset ring-ink-100 lg:flex" aria-live="off">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
      </span>
      OUSIA Chain (simulated) · block <span className="font-mono text-ink-900">{formatBlock(block)}</span>
    </div>
  );
}

export function ResetButton({ compact }: { compact?: boolean }) {
  const { resetDemo } = useStore();
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(true)}
        icon={<RotateCcw className="h-4 w-4" aria-hidden />}
        aria-label="Reset demo"
        className={compact ? 'w-9 px-0' : undefined}
      >
        {!compact && 'Reset demo'}
      </Button>
      <Modal open={confirming} onClose={() => setConfirming(false)} title="Reset the demo?">
        <p className="text-sm text-ink-600">
          This restores the seed data: Priya's balance, all assets, pending reviews and the ledger. Anything done in this session is cleared.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)} data-autofocus>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              setConfirming(false);
              resetDemo();
            }}
          >
            Reset
          </Button>
        </div>
      </Modal>
    </>
  );
}

export function TopBar() {
  const { demoOpen, setDemoOpen } = useStore();
  return (
    <header className="z-30 shrink-0 bg-white">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-16 md:px-6">
        <Logo />
        <RoleSwitcher className="hidden md:flex" />
        <div className="flex items-center gap-1">
          <BlockTicker />
          <Button
            variant="ghost"
            size="sm"
            className="w-9 px-0"
            aria-label="Demo script"
            aria-expanded={demoOpen}
            onClick={() => setDemoOpen(!demoOpen)}
            icon={<CircleHelp className="h-5 w-5" aria-hidden />}
          />
          <div className="hidden md:block">
            <ResetButton />
          </div>
          <div className="md:hidden">
            <ResetButton compact />
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <RoleSwitcher />
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-brass-300 to-transparent" aria-hidden />
    </header>
  );
}

function RoleContext() {
  const { state, priya } = useStore();
  const role = state.ui.role;
  const [title, sub, extra] =
    role === 'investor'
      ? [priya.name, `Investor · India · user #${priya.userNo}`, <KycBadge key="k" status={priya.kyc} />]
      : role === 'issuer'
        ? ['ABC Capital', 'Issuer · IFSCA registered', null]
        : ['Compliance & Ops', 'OUSIA operations desk', null];
  const initials = title
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-gradient text-sm font-semibold text-white ring-2 ring-brass-200">{initials}</div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink-950">{title}</p>
        <p className="truncate text-xs text-ink-500">{sub}</p>
        {extra && <div className="mt-1">{extra}</div>}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { items, active, select } = useNav();
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r border-ink-100 bg-white p-4 md:flex lg:w-64">
      <RoleContext />
      <nav aria-label="Sections">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cx(
                    'flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                    isActive ? 'bg-ink-sheen text-white shadow-sm' : 'text-ink-700 hover:bg-ink-50',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const { items, active, select } = useNav();
  return (
    <nav aria-label="Sections" className="shrink-0 border-t border-ink-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => select(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cx('flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium', isActive ? 'text-ink-950' : 'text-ink-500')}
              >
                <span className={cx('flex h-7 w-12 items-center justify-center rounded-full transition-colors', isActive && 'bg-ink-100')}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function DemoFooter() {
  return (
    <footer className="flex shrink-0 items-center justify-center gap-2 border-t border-amber-200 bg-amber-50 px-4 py-1.5 text-[11px] font-medium text-amber-900 md:justify-between md:px-6 md:text-xs">
      <span className="inline-flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5" aria-hidden />
        Demo: simulated data, not a live offering
      </span>
      <span className="hidden text-amber-800 md:inline">No real blockchain, KYC or payments are used.</span>
    </footer>
  );
}
