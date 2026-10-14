import { LedgerTable } from '../../components/LedgerTable';
import { Card, PageHeader } from '../../components/ui';
import { useStore } from '../../store';
import { useIssuerAssets } from './useIssuerAssets';

export function IssuerTransactions() {
  const { state } = useStore();
  const { assets } = useIssuerAssets();
  const ids = new Set(assets.map((a) => a.id));
  const events = state.ledger.filter((e) => e.assetId && ids.has(e.assetId));
  return (
    <>
      <PageHeader title="Transactions" subtitle="Every on-chain event for ABC Capital assets, newest first" />
      <Card className="overflow-hidden">
        <LedgerTable events={events} empty="No transactions for your assets yet." />
      </Card>
    </>
  );
}
