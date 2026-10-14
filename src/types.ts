export type Role = 'investor' | 'issuer' | 'compliance';

export type AssetClass = 'Bond' | 'Real Estate' | 'Gold' | 'T-Bill';
export type Country = 'IN' | 'AE';
export type Jurisdiction = 'GIFT_IFSC' | 'VARA' | 'ADGM';
export type AssetStatus = 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'LIVE' | 'REJECTED';
export type KycStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface Doc {
  id: string;
  name: string;
  size: string;
  addedAt: number;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  assetClass: AssetClass;
  country: Country;
  jurisdiction: Jurisdiction;
  regulator: string;
  issuer: string;
  issuerId: string;
  location: string;
  pricePerToken: number;
  minInvestment: number;
  yieldPct: number | null;
  yieldLabel: string;
  tenor: string;
  distribution: string;
  totalTokens: number;
  tokensSold: number;
  targetSize: number;
  investorsCount: number;
  status: AssetStatus;
  description: string;
  highlights: string[];
  documents: Doc[];
  contractAddress: string;
  fxCurrency?: 'AED' | 'USD';
  submittedAt: number;
}

export interface Investor {
  id: string;
  name: string;
  userNo: number;
  country: Country;
  jurisdiction: Jurisdiction;
  kyc: KycStatus;
  wallet: string;
  balance: number;
  email: string;
}

export interface Holding {
  investorId: string;
  assetId: string;
  tokens: number;
  costBasis: number;
  txHashes: string[];
}

export type ActionKind = 'ASSET_APPROVAL' | 'KYC' | 'SANCTIONS';
export type ActionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PendingAction {
  id: string;
  kind: ActionKind;
  title: string;
  detail: string;
  jurisdiction: Jurisdiction;
  refId: string;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: number;
  status: ActionStatus;
  resolvedAt?: number;
  txHash?: string;
}

export type ControlKey =
  | 'kycAml'
  | 'investorEligibility'
  | 'issuerEligibility'
  | 'txMonitoring'
  | 'walletScreening'
  | 'auditTrail';

export type LedgerEventType =
  | 'MINT'
  | 'INVEST'
  | 'TRANSFER'
  | 'TRANSFER_BLOCKED'
  | 'APPROVE'
  | 'REJECT'
  | 'KYC_VERIFIED'
  | 'KYC_REJECTED'
  | 'SANCTIONS_CLEARED'
  | 'WALLET_FROZEN'
  | 'ASSET_SUBMITTED'
  | 'LEGAL_VERIFIED'
  | 'DISTRIBUTION'
  | 'CONTROL_UPDATED'
  | 'DOC_ANCHORED';

export interface LedgerEvent {
  id: string;
  txHash: string;
  block: number;
  timestamp: number;
  type: LedgerEventType;
  from: string;
  fromLabel: string;
  to: string;
  toLabel: string;
  assetId?: string;
  tokens?: number;
  amountInr?: number;
  status: 'CONFIRMED' | 'BLOCKED';
  jurisdiction: Jurisdiction;
  memo: string;
  checks?: { rule: string; passed: boolean; detail: string }[];
  gasUsed: number;
  durationMs: number;
}

export type InvestorTab = 'home' | 'explore' | 'holdings' | 'me';
export type IssuerTab = 'assets' | 'investors' | 'tokens' | 'transactions' | 'reports';
export type ComplianceTab = 'overview' | 'controls' | 'explorer';

export interface UiState {
  role: Role;
  investorTab: InvestorTab;
  issuerTab: IssuerTab;
  complianceTab: ComplianceTab;
  investorAssetId: string | null;
  issuerAssetId: string;
  jurisdictionFilter: Jurisdiction | 'ALL';
}

export interface State {
  version: number;
  investors: Investor[];
  assets: Asset[];
  holdings: Holding[];
  actions: PendingAction[];
  ledger: LedgerEvent[];
  controls: Record<ControlKey, boolean>;
  baseline: {
    investors: Record<Jurisdiction, number>;
    reviews: Record<Jurisdiction, number>;
    alerts: Record<Jurisdiction, number>;
  };
  ui: UiState;
  demo: { auditViewed: boolean };
}
