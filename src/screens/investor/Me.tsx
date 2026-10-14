import { CheckCircle2, Plus } from 'lucide-react';
import { ResetButton } from '../../components/Layout';
import { LedgerTable } from '../../components/LedgerTable';
import { Button, Card, CopyButton, KeyValue, KycBadge, PageHeader, ProgressBar, SectionTitle } from '../../components/ui';
import { FX, formatInr } from '../../format';
import { useStore } from '../../store';

const LRS_LIMIT_INR = 250_000 * FX.USD;

export function Me() {
  const { state, priya, addFunds, toast, setDemoOpen } = useStore();
  const invested = state.ledger.filter((e) => e.type === 'INVEST' && e.to === priya.wallet).reduce((n, e) => n + (e.amountInr ?? 0), 0);
  const events = state.ledger.filter((e) => e.to === priya.wallet || e.from === priya.wallet);

  return (
    <>
      <PageHeader title="Me" subtitle="Profile, KYC status and wallet" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card as="section" className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-lg font-semibold text-white">PS</div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-navy-950">{priya.name}</p>
              <p className="truncate text-sm text-navy-500">
                {priya.email} · user #{priya.userNo}
              </p>
              <div className="mt-1">
                <KycBadge status={priya.kyc} />
              </div>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4">
            <KeyValue label="Residency">India</KeyValue>
            <KeyValue label="Investment route">LRS (Liberalised Remittance Scheme)</KeyValue>
            <KeyValue label="Investor category">Retail · accreditation not required</KeyValue>
            <KeyValue label="Onboarded under">IFSCA (GIFT IFSC)</KeyValue>
          </dl>
        </Card>

        <Card as="section" className="p-5">
          <SectionTitle>KYC status</SectionTitle>
          <ul className="space-y-2">
            {['PAN verified', 'Aadhaar e-KYC', 'Video KYC', 'FATCA / CRS declaration', 'Sanctions & PEP screening'].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-navy-800">
                <CheckCircle2 className="h-4 w-4 text-accent-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-navy-500">Verified claims are written to the OUSIA identity registry, so every token transfer can check them automatically.</p>
        </Card>

        <Card as="section" className="p-5">
          <SectionTitle>Wallet</SectionTitle>
          <p className="text-xs text-navy-500">Custodial smart wallet (MPC)</p>
          <div className="mt-1 flex items-start gap-1">
            <p className="min-w-0 flex-1 break-all font-mono text-sm text-navy-900">{priya.wallet}</p>
            <CopyButton value={priya.wallet} label="Copy wallet address" />
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-navy-500">Cash balance</p>
              <p className="text-xl font-semibold text-navy-950">{formatInr(priya.balance)}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="h-4 w-4" aria-hidden />}
              onClick={() => {
                addFunds(25_000);
                toast({ tone: 'success', title: 'Funds added', body: '₹25,000 added via UPI (simulated).' });
              }}
            >
              Add ₹25,000
            </Button>
          </div>
        </Card>

        <Card as="section" className="p-5">
          <SectionTitle>LRS usage this financial year</SectionTitle>
          <ProgressBar value={(invested / LRS_LIMIT_INR) * 100} label="LRS limit used" />
          <p className="mt-2 text-sm text-navy-700">
            {formatInr(invested)} of {formatInr(LRS_LIMIT_INR)} (USD 250,000)
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDemoOpen(true)}>
              Open demo script
            </Button>
            <ResetButton />
          </div>
        </Card>
      </div>

      <section className="mt-5">
        <SectionTitle>My on-chain activity</SectionTitle>
        <Card className="overflow-hidden">
          <LedgerTable events={events} />
        </Card>
      </section>
    </>
  );
}
