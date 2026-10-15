import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, ListChecks, X } from 'lucide-react';
import { DEMO_STEPS, type DemoStep } from '../demo';
import { useStore } from '../store';
import { Button, cx } from './ui';

function useDemo() {
  const { state, setUi } = useStore();
  const done = DEMO_STEPS.map((s) => s.done(state));
  const completed = done.filter(Boolean).length;
  const next = done.findIndex((d) => !d);
  const go = (step: DemoStep) =>
    setUi({
      role: step.go.role,
      ...(step.go.investorTab && { investorTab: step.go.investorTab, investorAssetId: step.go.assetId ?? null }),
      ...(step.go.issuerTab && { issuerTab: step.go.issuerTab }),
      ...(step.go.complianceTab && { complianceTab: step.go.complianceTab }),
    });
  return { done, completed, next, go };
}

function StepList({ className }: { className?: string }) {
  const { done, next, go } = useDemo();
  return (
    <ol className={cx('divide-y divide-ink-100 overflow-y-auto', className)}>
      {DEMO_STEPS.map((step, i) => {
        const isDone = done[i];
        const isNext = i === next;
        return (
          <li key={step.n}>
            <button type="button" onClick={() => go(step)} className={cx('flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-ink-50', isNext && 'bg-accent-50/70')}>
              <span
                className={cx(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isDone ? 'bg-accent-600 text-white' : isNext ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600',
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" aria-label="Done" /> : step.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cx('block text-sm font-medium', isDone ? 'text-ink-500 line-through decoration-ink-300' : 'text-ink-900')}>{step.title}</span>
                <span className="block text-xs text-ink-500">{step.hint}</span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Progress({ completed }: { completed: number }) {
  return (
    <div className="h-1 bg-ink-100" aria-hidden>
      <div className="h-full bg-gradient-to-r from-brass-300 to-brass-600 transition-all" style={{ width: `${(completed / DEMO_STEPS.length) * 100}%` }} />
    </div>
  );
}

/** Right-hand column on wide screens; never overlaps the app. */
export function DemoAside() {
  const { demoOpen, setDemoOpen } = useStore();
  const { completed } = useDemo();
  if (!demoOpen) return null;
  return (
    <aside aria-label="Demo script" className="hidden w-80 shrink-0 flex-col border-l border-ink-100 bg-white xl:flex">
      <div className="flex items-center justify-between gap-2 bg-ink-gradient px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4" aria-hidden />
          <p className="text-sm font-semibold">Demo script</p>
          <span data-testid="demo-progress" className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
            {completed}/{DEMO_STEPS.length}
          </span>
        </div>
        <button type="button" onClick={() => setDemoOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close demo script">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <Progress completed={completed} />
      <StepList className="flex-1" />
    </aside>
  );
}

/** Collapsible strip under the top bar on phones, tablets and laptops below 1280px. */
export function DemoStrip() {
  const { demoOpen, setDemoOpen } = useStore();
  const { completed, next, go } = useDemo();
  const [expanded, setExpanded] = useState(false);
  if (!demoOpen) return null;
  const nextStep = next >= 0 ? DEMO_STEPS[next] : null;
  return (
    <section aria-label="Demo script" className="shrink-0 border-b border-ink-200 bg-white xl:hidden">
      <div className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 text-left"
        >
          <span data-testid="demo-progress" className="shrink-0 rounded-full bg-ink-gradient px-2 py-0.5 text-xs font-semibold text-white">
            {completed}/{DEMO_STEPS.length}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-ink-800">
            {nextStep ? (
              <>
                <span className="text-ink-500">Next: </span>
                {nextStep.title}
              </>
            ) : (
              'Demo loop complete'
            )}
          </span>
          <ChevronDown className={cx('h-4 w-4 shrink-0 text-ink-500 transition-transform', expanded && 'rotate-180')} aria-hidden />
        </button>
        {nextStep && (
          <Button size="sm" variant="secondary" onClick={() => go(nextStep)}>
            Go
          </Button>
        )}
        <button type="button" onClick={() => setDemoOpen(false)} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100" aria-label="Close demo script">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <Progress completed={completed} />
      {expanded && <StepList className="max-h-[45dvh]" />}
    </section>
  );
}
