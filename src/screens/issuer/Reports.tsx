import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { wait } from '../../chain';
import { Button, Card, PageHeader } from '../../components/ui';
import { EVENT_LABEL, formatDateTime } from '../../format';
import { useStore } from '../../store';
import { capTable } from './Investors';
import { useIssuerAssets } from './useIssuerAssets';

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function IssuerReports() {
  const { state, toast } = useStore();
  const { assets } = useIssuerAssets();
  const [busy, setBusy] = useState<string | null>(null);
  const ids = new Set(assets.map((a) => a.id));

  const reports = [
    {
      id: 'register',
      title: 'Investor register',
      body: 'Holders, wallets, KYC status and token balances for every ABC Capital asset.',
      build: (): (string | number)[][] => [
        ['Asset', 'Holder', 'Wallet', 'KYC', 'Tokens'],
        ...assets.flatMap((a) => capTable(state, a.id).holders.map((h) => [a.name, h.name, h.wallet, h.kyc, h.tokens])),
      ],
    },
    {
      id: 'transactions',
      title: 'Transaction report',
      body: 'All on-chain events with hashes and block numbers, for reconciliation and audit.',
      build: (): (string | number)[][] => [
        ['Time', 'Type', 'Status', 'From', 'To', 'Asset', 'Tokens', 'Value INR', 'Tx hash', 'Block'],
        ...state.ledger
          .filter((e) => e.assetId && ids.has(e.assetId))
          .map((e) => [
            formatDateTime(e.timestamp),
            EVENT_LABEL[e.type],
            e.status,
            e.fromLabel,
            e.toLabel,
            assets.find((a) => a.id === e.assetId)?.name ?? '',
            e.tokens ?? '',
            e.amountInr ?? '',
            e.txHash,
            e.block,
          ]),
      ],
    },
    {
      id: 'regulatory',
      title: 'IFSCA quarterly return',
      body: 'Issuance status, amounts raised and investor counts, in the regulator filing format (simulated).',
      build: (): (string | number)[][] => [
        ['Asset', 'Status', 'Jurisdiction', 'Target INR', 'Tokens distributed', 'Raised INR', 'Investors'],
        ...assets.map((a) => [a.name, a.status, a.jurisdiction, a.targetSize, a.tokensSold, a.tokensSold * a.pricePerToken, a.investorsCount]),
      ],
    },
  ];

  return (
    <>
      <PageHeader title="Reports" subtitle="Generated from the on-chain register. Downloads are CSV files built in your browser." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.id} as="article" className="flex flex-col p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
              <FileSpreadsheet className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-3 font-semibold text-ink-950">{r.title}</h2>
            <p className="mt-1 flex-1 text-sm text-ink-600">{r.body}</p>
            <Button
              variant="secondary"
              className="mt-4"
              loading={busy === r.id}
              icon={<Download className="h-4 w-4" aria-hidden />}
              onClick={async () => {
                setBusy(r.id);
                await wait(600);
                downloadCsv(`ousia-abc-capital-${r.id}.csv`, r.build());
                setBusy(null);
                toast({ tone: 'success', title: `${r.title} downloaded` });
              }}
            >
              {busy === r.id ? 'Generating…' : 'Generate CSV'}
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
