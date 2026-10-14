import { useStore } from '../../store';
import { AssetDetail } from './AssetDetail';
import { Explore } from './Explore';
import { Holdings } from './Holdings';
import { Home } from './Home';
import { Me } from './Me';

export function InvestorApp() {
  const { state, assetById } = useStore();
  const { investorTab, investorAssetId } = state.ui;
  const asset = assetById(investorAssetId);
  if (asset && asset.status === 'LIVE') return <AssetDetail asset={asset} />;
  if (investorTab === 'explore') return <Explore />;
  if (investorTab === 'holdings') return <Holdings />;
  if (investorTab === 'me') return <Me />;
  return <Home />;
}
