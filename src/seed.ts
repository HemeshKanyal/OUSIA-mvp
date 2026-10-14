import { currentBlock, fakeTxHash } from './chain';
import type { Asset, Holding, Investor, LedgerEvent, PendingAction, State } from './types';

export const STATE_VERSION = 3;

export const PRIYA_ID = 'inv_priya';
export const RAHUL_ID = 'inv_rahul';
export const ABC_ISSUER_ID = 'iss_abc';
export const MUMBAI_ID = 'mumbai-bkc';
export const DUBAI_ID = 'dubai-marina-1204';

export const PRIYA_WALLET = '0x7c3e5b9d2f4a18e6c0b7d3f9e2a1c4b8d6e0a91f';
export const RAHUL_WALLET = '0x3b81f0c2e9d4a7b6c5e8f1a2d3c4b5a6e7f84d2c';
export const COMPLIANCE_WALLET = '0xc0a1f5e2d3b4a5968778695a4b3c2d1e0f1a2b3c';
export const IDENTITY_REGISTRY = '0x1d3e7a9b2c4f6e8d0a1b3c5d7e9f2a4b6c8d0e1f';

export const ISSUER_TREASURY: Record<string, string> = {
  iss_lt: '0x4f2a9c1e8b7d6a5f4e3d2c1b0a9f8e7d6c5b4a39',
  iss_marina: '0x8e1d4c7b0a3f6e9d2c5b8a1f4e7d0c3b6a9f2e58',
  iss_vault: '0x2b5e8d1c4a7f0e3d6c9b2a5f8e1d4c7b0a3f6e91',
  iss_tbill: '0x6a9d2c5f8b1e4d7a0c3f6b9e2d5a8c1f4b7e0d23',
  [ABC_ISSUER_ID]: '0x9f3c6b0e2d5a8f1c4e7b0d3a6f9c2e5b8d1a4c76',
};

const DAY = 86_400_000;

/** Spread seeded times across the working day so history does not look machine-generated. */
const jitter = (ts: number) => ts - Math.floor(Math.random() * 6 * 3_600_000);

const pdf = (name: string, size: string, addedAt: number) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name,
  size,
  addedAt: jitter(addedAt),
});

function seedAssets(now: number): Asset[] {
  return [
    {
      id: 'lt-bond-2029',
      name: 'L&T 7.8% Corporate Bond 2029',
      symbol: 'oLT29',
      assetClass: 'Bond',
      country: 'IN',
      jurisdiction: 'GIFT_IFSC',
      regulator: 'IFSCA (GIFT IFSC)',
      issuer: 'Larsen & Toubro Ltd.',
      issuerId: 'iss_lt',
      location: 'GIFT City, Gujarat',
      pricePerToken: 1000,
      minInvestment: 1000,
      yieldPct: 7.8,
      yieldLabel: 'Coupon',
      tenor: '3 yrs (matures Mar 2029)',
      distribution: 'Semi-annual coupon',
      totalTokens: 2_000_000,
      tokensSold: 1_412_350,
      targetSize: 2_000_000_000,
      investorsCount: 4212,
      status: 'LIVE',
      description:
        'Senior unsecured corporate bond tokenised 1:1 into ₹1,000 units. Coupons are paid out automatically to token holders on each record date, and the register is kept on-chain.',
      highlights: ['AAA (simulated rating)', 'Semi-annual coupons', 'Listed under the GIFT IFSC framework'],
      documents: [
        pdf('Information Memorandum.pdf', '2.4 MB', now - 40 * DAY),
        pdf('Trust Deed.pdf', '880 KB', now - 40 * DAY),
        pdf('Credit Rating Letter.pdf', '310 KB', now - 38 * DAY),
      ],
      contractAddress: '0x5a1f3e7c9b2d4f6a8c0e1b3d5f7a9c2e4b6d8f01',
      submittedAt: now - 45 * DAY,
    },
    {
      id: DUBAI_ID,
      name: 'Dubai Marina Residence, Unit 1204',
      symbol: 'oDMR1204',
      assetClass: 'Real Estate',
      country: 'AE',
      jurisdiction: 'VARA',
      regulator: 'VARA · DLD',
      issuer: 'Marina Heights SPV Ltd.',
      issuerId: 'iss_marina',
      location: 'Dubai Marina, Dubai',
      pricePerToken: 500,
      minInvestment: 500,
      yieldPct: 6.5,
      yieldLabel: 'Est. rental yield',
      tenor: 'Open-ended (5 yr target hold)',
      distribution: 'Quarterly rental distribution',
      totalTokens: 120_000,
      tokensSold: 81_240,
      targetSize: 60_000_000,
      investorsCount: 1386,
      status: 'LIVE',
      fxCurrency: 'AED',
      description:
        'Fractional ownership of a 2-bed, sea-facing apartment held in a Dubai SPV. The title is registered with the Dubai Land Department and mirrored on-chain. Net rent is distributed to holders every quarter.',
      highlights: ['DLD title deed mirrored on-chain', 'Professionally managed, 96% occupancy', 'Quarterly rental distribution'],
      documents: [
        pdf('Offering Document.pdf', '3.1 MB', now - 30 * DAY),
        pdf('DLD Title Deed (redacted).pdf', '540 KB', now - 30 * DAY),
        pdf('Independent Valuation Report.pdf', '1.7 MB', now - 28 * DAY),
        pdf('SPV Articles of Association.pdf', '760 KB', now - 30 * DAY),
      ],
      contractAddress: '0x7b2e4d6f8a0c1e3b5d7f9a2c4e6b8d0f1a3c5e72',
      submittedAt: now - 35 * DAY,
    },
    {
      id: 'ousia-gold',
      name: 'OUSIA Gold Token, 1 token = 0.1 g',
      symbol: 'oGOLD',
      assetClass: 'Gold',
      country: 'IN',
      jurisdiction: 'GIFT_IFSC',
      regulator: 'IFSCA (GIFT IFSC)',
      issuer: 'OUSIA Vault Trust',
      issuerId: 'iss_vault',
      location: 'Insured vault, GIFT City',
      pricePerToken: 720,
      minInvestment: 720,
      yieldPct: null,
      yieldLabel: 'Yield',
      tenor: 'Perpetual, redeemable for physical gold',
      distribution: 'None (tracks gold price)',
      totalTokens: 5_000_000,
      tokensSold: 2_640_180,
      targetSize: 3_600_000_000,
      investorsCount: 9814,
      status: 'LIVE',
      description:
        'Each token represents 0.1 g of 999.9 fine gold held in an insured, audited vault. Bar serial numbers are reconciled against token supply every day.',
      highlights: ['1 token = 0.1 g, 999.9 fine', 'Daily proof-of-reserve', 'Redeemable from 10 g'],
      documents: [
        pdf('Vault Custody Agreement.pdf', '1.2 MB', now - 60 * DAY),
        pdf('Proof of Reserve (latest).pdf', '220 KB', now - 1 * DAY),
        pdf('Bar List.pdf', '410 KB', now - 1 * DAY),
      ],
      contractAddress: '0x3c5e7a9b1d2f4a6c8e0b2d4f6a8c0e1b3d5f7a93',
      submittedAt: now - 70 * DAY,
    },
    {
      id: 'tbill-91d',
      name: '91-Day T-Bill',
      symbol: 'oTB91',
      assetClass: 'T-Bill',
      country: 'IN',
      jurisdiction: 'GIFT_IFSC',
      regulator: 'IFSCA (GIFT IFSC)',
      issuer: 'Govt. of India T-Bill, via OUSIA Nominee',
      issuerId: 'iss_tbill',
      location: 'India',
      pricePerToken: 1000,
      minInvestment: 1000,
      yieldPct: 6.6,
      yieldLabel: 'Yield',
      tenor: '91 days',
      distribution: 'Paid at maturity',
      totalTokens: 1_000_000,
      tokensSold: 702_400,
      targetSize: 1_000_000_000,
      investorsCount: 3027,
      status: 'LIVE',
      description:
        'Sovereign 91-day Treasury Bills held by a regulated nominee and tokenised into ₹1,000 units. Principal plus discount is paid out automatically at maturity.',
      highlights: ['Sovereign credit', 'Matures in 91 days', 'Automatic payout at maturity'],
      documents: [
        pdf('Nominee Structure Note.pdf', '650 KB', now - 20 * DAY),
        pdf('Auction Allotment Statement.pdf', '190 KB', now - 6 * DAY),
      ],
      contractAddress: '0x9d1f3b5c7e9a2c4e6b8d0f1a3c5e7b9d2f4a6c84',
      submittedAt: now - 22 * DAY,
    },
    {
      id: MUMBAI_ID,
      name: 'Mumbai Commercial Property, BKC',
      symbol: 'oBKC',
      assetClass: 'Real Estate',
      country: 'IN',
      jurisdiction: 'GIFT_IFSC',
      regulator: 'IFSCA (GIFT IFSC)',
      issuer: 'ABC Capital',
      issuerId: ABC_ISSUER_ID,
      location: 'Bandra Kurla Complex, Mumbai',
      pricePerToken: 1000,
      minInvestment: 1000,
      yieldPct: 7.2,
      yieldLabel: 'Est. rental yield',
      tenor: '7 yr target hold',
      distribution: 'Quarterly rental distribution',
      totalTokens: 500_000,
      tokensSold: 0,
      targetSize: 500_000_000,
      investorsCount: 0,
      status: 'IN_REVIEW',
      description:
        'Grade-A office floors in Bandra Kurla Complex, leased to two multinational tenants on 9-year leases. Held in an SPV and tokenised into ₹1,000 units.',
      highlights: ['Grade-A office, 42,000 sq ft', '9-year leases, 2 MNC tenants', 'Quarterly rental distribution'],
      documents: [
        pdf('Information Memorandum.pdf', '2.9 MB', now - 9 * DAY),
        pdf('Title Search Report.pdf', '1.1 MB', now - 9 * DAY),
        pdf('Legal Opinion.pdf', '480 KB', now - 4 * DAY),
        pdf('Lease Agreements (summary).pdf', '720 KB', now - 9 * DAY),
      ],
      contractAddress: '0xab4c6e8f0a2b4c6d8e0f1a3b5c7d9e1f2a4b6c88',
      submittedAt: now - 9 * DAY,
    },
  ];
}

function seedInvestors(): Investor[] {
  return [
    {
      id: PRIYA_ID,
      name: 'Priya S.',
      userNo: 1001,
      country: 'IN',
      jurisdiction: 'GIFT_IFSC',
      kyc: 'VERIFIED',
      wallet: PRIYA_WALLET,
      balance: 50_000,
      email: 'priya.s@example.com',
    },
    {
      id: RAHUL_ID,
      name: 'Rahul M.',
      userNo: 1928,
      country: 'IN',
      jurisdiction: 'GIFT_IFSC',
      kyc: 'PENDING',
      wallet: RAHUL_WALLET,
      balance: 20_000,
      email: 'rahul.m@example.com',
    },
  ];
}

function seedActions(now: number): PendingAction[] {
  return [
    {
      id: 'act_abc_asset',
      kind: 'ASSET_APPROVAL',
      title: 'Asset approval: ABC Capital, Mumbai Commercial Property',
      detail: '₹50 Cr · Real Estate · legal opinion received, all documents on file',
      jurisdiction: 'GIFT_IFSC',
      refId: MUMBAI_ID,
      priority: 'High',
      createdAt: now - 4 * DAY,
      status: 'PENDING',
    },
    {
      id: 'act_kyc_1928',
      kind: 'KYC',
      title: 'Investor KYC: user #1928',
      detail: 'Rahul M. · India · PAN and Aadhaar e-KYC submitted, video KYC complete',
      jurisdiction: 'GIFT_IFSC',
      refId: RAHUL_ID,
      priority: 'Medium',
      createdAt: now - 2 * DAY,
      status: 'PENDING',
    },
    {
      id: 'act_sanctions_2001',
      kind: 'SANCTIONS',
      title: 'Sanctions review: user #2001',
      detail: 'Partial name match (score 0.71) on a UAE local list · wallet held pending review',
      jurisdiction: 'VARA',
      refId: 'user_2001',
      priority: 'High',
      createdAt: now - 1 * DAY,
      status: 'PENDING',
    },
  ];
}

function event(partial: Omit<LedgerEvent, 'id' | 'txHash' | 'block' | 'gasUsed' | 'durationMs' | 'status'> & Partial<LedgerEvent>): LedgerEvent {
  const txHash = partial.txHash ?? fakeTxHash();
  const timestamp = jitter(partial.timestamp);
  return {
    id: txHash.slice(2, 14),
    txHash,
    block: currentBlock(timestamp),
    gasUsed: 52_000 + Math.floor(Math.random() * 30_000),
    durationMs: 1200,
    status: 'CONFIRMED',
    ...partial,
    timestamp,
  };
}

function seedLedger(now: number, assets: Asset[]): { ledger: LedgerEvent[]; holdings: Holding[] } {
  const byId = Object.fromEntries(assets.map((a) => [a.id, a]));
  const ledger: LedgerEvent[] = [];

  for (const a of assets.filter((x) => x.status === 'LIVE')) {
    ledger.push(
      event({
        timestamp: a.submittedAt + 5 * DAY,
        type: 'MINT',
        from: '0x0000000000000000000000000000000000000000',
        fromLabel: 'Token contract',
        to: ISSUER_TREASURY[a.issuerId],
        toLabel: `${a.issuer} treasury`,
        assetId: a.id,
        tokens: a.totalTokens,
        amountInr: a.totalTokens * a.pricePerToken,
        jurisdiction: a.jurisdiction,
        memo: `Initial issuance of ${a.symbol}`,
      }),
    );
  }

  ledger.push(
    event({
      timestamp: now - 12 * DAY,
      type: 'KYC_VERIFIED',
      from: COMPLIANCE_WALLET,
      fromLabel: 'OUSIA Compliance',
      to: PRIYA_WALLET,
      toLabel: 'Priya S.',
      jurisdiction: 'GIFT_IFSC',
      memo: 'Identity registry: claim added (KYC, country = IN)',
    }),
  );

  const gold = byId['ousia-gold'];
  const tbill = byId['tbill-91d'];
  const goldTx = event({
    timestamp: now - 10 * DAY,
    type: 'INVEST',
    from: ISSUER_TREASURY[gold.issuerId],
    fromLabel: `${gold.issuer} treasury`,
    to: PRIYA_WALLET,
    toLabel: 'Priya S.',
    assetId: gold.id,
    tokens: 20,
    amountInr: 20 * gold.pricePerToken,
    jurisdiction: gold.jurisdiction,
    memo: 'Atomic DvP settlement',
  });
  const tbillTx = event({
    timestamp: now - 6 * DAY,
    type: 'INVEST',
    from: ISSUER_TREASURY[tbill.issuerId],
    fromLabel: `${tbill.issuer} treasury`,
    to: PRIYA_WALLET,
    toLabel: 'Priya S.',
    assetId: tbill.id,
    tokens: 10,
    amountInr: 10 * tbill.pricePerToken,
    jurisdiction: tbill.jurisdiction,
    memo: 'Atomic DvP settlement',
  });
  ledger.push(goldTx, tbillTx);

  ledger.push(
    event({
      timestamp: now - 9 * DAY,
      type: 'ASSET_SUBMITTED',
      from: ISSUER_TREASURY[ABC_ISSUER_ID],
      fromLabel: 'ABC Capital',
      to: COMPLIANCE_WALLET,
      toLabel: 'OUSIA Compliance',
      assetId: MUMBAI_ID,
      jurisdiction: 'GIFT_IFSC',
      memo: 'Issuance application filed, document hashes anchored',
    }),
    event({
      timestamp: now - 4 * DAY,
      type: 'LEGAL_VERIFIED',
      from: COMPLIANCE_WALLET,
      fromLabel: 'Legal counsel (panel)',
      to: ISSUER_TREASURY[ABC_ISSUER_ID],
      toLabel: 'ABC Capital',
      assetId: MUMBAI_ID,
      jurisdiction: 'GIFT_IFSC',
      memo: 'Title and SPV structure verified, legal opinion anchored',
    }),
    event({
      timestamp: now - 3 * DAY,
      type: 'DISTRIBUTION',
      from: ISSUER_TREASURY.iss_lt,
      fromLabel: 'Larsen & Toubro Ltd.',
      to: '0x0000000000000000000000000000000000d15a',
      toLabel: '4,212 holders',
      assetId: 'lt-bond-2029',
      amountInr: 1_412_350 * 1000 * 0.039,
      jurisdiction: 'GIFT_IFSC',
      memo: 'Semi-annual coupon distribution (3.9%)',
    }),
    event({
      timestamp: now - 1 * DAY,
      type: 'DISTRIBUTION',
      from: ISSUER_TREASURY.iss_marina,
      fromLabel: 'Marina Heights SPV Ltd.',
      to: '0x0000000000000000000000000000000000d15b',
      toLabel: '1,386 holders',
      assetId: DUBAI_ID,
      amountInr: 81_240 * 500 * 0.01625,
      jurisdiction: 'VARA',
      memo: 'Quarterly rental distribution',
    }),
  );

  ledger.sort((a, b) => a.timestamp - b.timestamp);

  const holdings: Holding[] = [
    { investorId: PRIYA_ID, assetId: gold.id, tokens: 20, costBasis: 20 * gold.pricePerToken, txHashes: [goldTx.txHash] },
    { investorId: PRIYA_ID, assetId: tbill.id, tokens: 10, costBasis: 10 * tbill.pricePerToken, txHashes: [tbillTx.txHash] },
  ];
  return { ledger, holdings };
}

export function createSeed(): State {
  const now = Date.now();
  const assets = seedAssets(now);
  const { ledger, holdings } = seedLedger(now, assets);
  return {
    version: STATE_VERSION,
    investors: seedInvestors(),
    assets,
    holdings,
    actions: seedActions(now),
    ledger,
    controls: {
      kycAml: true,
      investorEligibility: true,
      issuerEligibility: true,
      txMonitoring: true,
      walletScreening: true,
      auditTrail: true,
    },
    // Background numbers for everything not modelled one-by-one in the demo.
    // Totals line up with the brief: 12,481 investors, 23 pending reviews, 4 alerts.
    baseline: {
      investors: { GIFT_IFSC: 8912, VARA: 3104, ADGM: 465 },
      reviews: { GIFT_IFSC: 13, VARA: 5, ADGM: 2 },
      alerts: { GIFT_IFSC: 1, VARA: 1, ADGM: 1 },
    },
    ui: {
      role: 'investor',
      investorTab: 'home',
      issuerTab: 'assets',
      complianceTab: 'overview',
      investorAssetId: null,
      issuerAssetId: MUMBAI_ID,
      jurisdictionFilter: 'ALL',
    },
    demo: { auditViewed: false },
  };
}
