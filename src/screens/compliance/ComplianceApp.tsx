import { JURISDICTION_LABEL } from '../../format';
import { useStore } from '../../store';
import type { Jurisdiction } from '../../types';
import { Controls } from './Controls';
import { Explorer } from './Explorer';
import { Overview } from './Overview';

const TITLES = {
  overview: ['Compliance & Operations', 'Reviews, alerts and jurisdiction rules across the platform'],
  controls: ['Regulatory controls', 'Rule modules enforced by the platform and the tokens'],
  explorer: ['OUSIA Explorer', 'Append-only audit log of every on-chain event'],
} as const;

export function ComplianceApp() {
  const { state, setUi } = useStore();
  const tab = state.ui.complianceTab;
  const [title, subtitle] = TITLES[tab];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-navy-950 md:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-navy-500">{subtitle}</p>
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="jur-filter" className="block text-xs font-medium text-navy-600">
            Jurisdiction
          </label>
          <select
            id="jur-filter"
            value={state.ui.jurisdictionFilter}
            onChange={(e) => setUi({ jurisdictionFilter: e.target.value as Jurisdiction | 'ALL' })}
            className="mt-1 h-10 w-full rounded-xl border border-navy-200 bg-white px-3 text-sm font-medium text-navy-900 sm:w-56"
          >
            <option value="ALL">All jurisdictions</option>
            {(Object.keys(JURISDICTION_LABEL) as Jurisdiction[]).map((j) => (
              <option key={j} value={j}>
                {JURISDICTION_LABEL[j]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {tab === 'overview' && <Overview />}
      {tab === 'controls' && <Controls />}
      {tab === 'explorer' && <Explorer />}
    </>
  );
}
