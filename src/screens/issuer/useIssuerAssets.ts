import { ABC_ISSUER_ID } from '../../seed';
import { useStore } from '../../store';

export function useIssuerAssets() {
  const { state } = useStore();
  const assets = state.assets.filter((a) => a.issuerId === ABC_ISSUER_ID);
  const selected = assets.find((a) => a.id === state.ui.issuerAssetId) ?? assets[0];
  return { assets, selected };
}
