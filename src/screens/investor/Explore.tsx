import { useState } from 'react';
import { SearchX } from 'lucide-react';
import { Chip, EmptyState, PageHeader } from '../../components/ui';
import { CLASS_FILTERS } from '../../format';
import { MUMBAI_ID } from '../../seed';
import { useStore } from '../../store';
import type { AssetClass } from '../../types';
import { AssetCard } from './AssetCard';

export function Explore() {
  const { state } = useStore();
  const [filter, setFilter] = useState<AssetClass | 'All'>('All');
  const live = state.assets.filter((a) => a.status === 'LIVE');
  const shown = live.filter((a) => filter === 'All' || a.assetClass === filter);
  const mumbaiNew = state.assets.some((a) => a.id === MUMBAI_ID && a.status === 'LIVE' && a.tokensSold === 0);

  return (
    <>
      <PageHeader title="Explore" subtitle={`${live.length} regulated offerings open for investment, settled 24x7`} />
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filter by asset class">
        {CLASS_FILTERS.map((f) => (
          <Chip key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </Chip>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={<SearchX className="h-5 w-5" aria-hidden />} title="No offerings in this category yet" body="Try another asset class." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((a) => (
            <AssetCard key={a.id} asset={a} highlight={mumbaiNew && a.id === MUMBAI_ID} />
          ))}
        </div>
      )}
    </>
  );
}
