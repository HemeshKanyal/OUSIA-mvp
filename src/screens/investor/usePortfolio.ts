import { PRIYA_ID } from '../../seed';
import { useStore } from '../../store';

export function usePortfolio() {
  const { state } = useStore();
  const rows = state.holdings
    .filter((h) => h.investorId === PRIYA_ID && h.tokens > 0)
    .map((h) => {
      const asset = state.assets.find((a) => a.id === h.assetId)!;
      const value = h.tokens * asset.pricePerToken;
      return { holding: h, asset, value, income: asset.yieldPct ? (value * asset.yieldPct) / 100 : 0 };
    });
  return {
    rows,
    count: rows.length,
    value: rows.reduce((n, r) => n + r.value, 0),
    annualIncome: rows.reduce((n, r) => n + r.income, 0),
  };
}
