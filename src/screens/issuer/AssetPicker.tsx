import { cx } from '../../components/ui';
import { useStore } from '../../store';
import { useIssuerAssets } from './useIssuerAssets';

export function AssetPicker() {
  const { setUi } = useStore();
  const { assets, selected } = useIssuerAssets();
  if (assets.length < 2) return null;
  return (
    <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Select asset">
      {assets.map((a) => (
        <button
          key={a.id}
          type="button"
          aria-pressed={a.id === selected?.id}
          onClick={() => setUi({ issuerAssetId: a.id })}
          className={cx(
            'h-9 shrink-0 rounded-full px-4 text-sm font-medium',
            a.id === selected?.id ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 ring-1 ring-inset ring-navy-200 hover:bg-navy-50',
          )}
        >
          <span className="block max-w-[14rem] truncate">{a.name}</span>
        </button>
      ))}
    </div>
  );
}
