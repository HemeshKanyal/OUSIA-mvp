import { DUBAI_ID, MUMBAI_ID, PRIYA_WALLET, RAHUL_WALLET } from './seed';
import type { ComplianceTab, InvestorTab, IssuerTab, Role, State } from './types';

export interface DemoStep {
  n: number;
  role: Role;
  title: string;
  hint: string;
  done: (s: State) => boolean;
  go: { role: Role; investorTab?: InvestorTab; issuerTab?: IssuerTab; complianceTab?: ComplianceTab; assetId?: string };
}

const has = (s: State, pred: (e: State['ledger'][number]) => boolean) => s.ledger.some(pred);

export const DEMO_STEPS: DemoStep[] = [
  {
    n: 1,
    role: 'investor',
    title: 'Invest ₹5,000 in Dubai Marina',
    hint: 'Explore → Dubai Marina → Invest',
    done: (s) => has(s, (e) => e.type === 'INVEST' && e.assetId === DUBAI_ID && e.to === PRIYA_WALLET),
    go: { role: 'investor', investorTab: 'explore', assetId: DUBAI_ID },
  },
  {
    n: 2,
    role: 'investor',
    title: 'Try to transfer to Rahul: blocked',
    hint: 'Holdings → Transfer → Rahul M.',
    done: (s) => has(s, (e) => e.type === 'TRANSFER_BLOCKED' && e.to === RAHUL_WALLET),
    go: { role: 'investor', investorTab: 'holdings' },
  },
  {
    n: 3,
    role: 'compliance',
    title: 'See both events in the audit log',
    hint: 'Compliance → Explorer',
    done: (s) => s.demo.auditViewed,
    go: { role: 'compliance', complianceTab: 'explorer' },
  },
  {
    n: 4,
    role: 'compliance',
    title: 'Approve the ABC Capital asset',
    hint: 'Compliance → Overview → Pending actions',
    done: (s) => has(s, (e) => e.type === 'APPROVE' && e.assetId === MUMBAI_ID),
    go: { role: 'compliance', complianceTab: 'overview' },
  },
  {
    n: 5,
    role: 'issuer',
    title: 'Stepper advances: issue tokens',
    hint: 'Issuer → Assets → Issue tokens',
    done: (s) => has(s, (e) => e.type === 'MINT' && e.assetId === MUMBAI_ID),
    go: { role: 'issuer', issuerTab: 'assets' },
  },
  {
    n: 6,
    role: 'investor',
    title: 'Mumbai BKC is LIVE: invest',
    hint: 'Explore → Mumbai Commercial Property',
    done: (s) => has(s, (e) => e.type === 'INVEST' && e.assetId === MUMBAI_ID && e.to === PRIYA_WALLET),
    go: { role: 'investor', investorTab: 'explore', assetId: MUMBAI_ID },
  },
  {
    n: 7,
    role: 'compliance',
    title: "Approve Rahul's KYC",
    hint: 'Compliance → Investor KYC: user #1928',
    done: (s) => has(s, (e) => e.type === 'KYC_VERIFIED' && e.to === RAHUL_WALLET),
    go: { role: 'compliance', complianceTab: 'overview' },
  },
  {
    n: 8,
    role: 'investor',
    title: 'Transfer to Rahul now succeeds',
    hint: 'Holdings → Transfer → Rahul M.',
    done: (s) => has(s, (e) => e.type === 'TRANSFER' && e.status === 'CONFIRMED' && e.to === RAHUL_WALLET),
    go: { role: 'investor', investorTab: 'holdings' },
  },
];
