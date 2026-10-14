import type { Jurisdiction } from '../../types';

export interface Rule {
  title: string;
  detail: string;
  onChain: boolean;
}

export const RULESETS: Record<Jurisdiction, { regulator: string; currency: string; rules: Rule[] }> = {
  GIFT_IFSC: {
    regulator: 'IFSCA · GIFT City, India',
    currency: 'USD-denominated settlement, INR shown to investors',
    rules: [
      { title: 'LRS route for resident individuals', detail: 'Up to USD 250,000 per financial year per investor, tracked across all holdings.', onChain: true },
      { title: 'USD-denominated issuance', detail: 'Offerings are issued and settled in USD inside the IFSC; INR equivalents are indicative.', onChain: false },
      { title: 'Verified investors only', detail: 'Every holder must carry a valid KYC claim in the identity registry.', onChain: true },
      { title: 'Suspicious transaction reporting', detail: 'Alerts escalate to FIU-IND within the regulatory timeline.', onChain: false },
    ],
  },
  VARA: {
    regulator: 'VARA · Dubai (with DLD for real estate)',
    currency: 'AED settlement, INR shown to Indian investors',
    rules: [
      { title: 'Per-investor limits', detail: 'Retail investors are capped per asset (demo rule: AED 500,000), enforced by the token.', onChain: true },
      { title: 'DLD title mirroring', detail: 'Real estate tokens must reference a registered DLD title deed.', onChain: true },
      { title: 'Wallet screening on every transfer', detail: 'Both wallets are screened against UAE local and international lists.', onChain: true },
      { title: 'Marketing & disclosure', detail: 'Risk disclosures shown before every investment.', onChain: false },
    ],
  },
  ADGM: {
    regulator: 'FSRA · Abu Dhabi Global Market',
    currency: 'USD settlement',
    rules: [
      { title: 'Professional clients only', detail: 'Unlisted RWA offerings are restricted to professional clients (demo rule).', onChain: true },
      { title: 'Custody segregation', detail: 'Client assets held in segregated, FSRA-recognised custody.', onChain: false },
      { title: 'Max holders per offering', detail: 'Holder count capped per offering, enforced at transfer time.', onChain: true },
      { title: 'Annual audit', detail: 'Proof-of-reserve and register audit filed annually.', onChain: false },
    ],
  },
};
