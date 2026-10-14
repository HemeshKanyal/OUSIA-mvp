import type { Asset, AssetClass, Jurisdiction, LedgerEventType } from './types';

export const FX = { USD: 88.2, AED: 24.02 };

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export function formatInr(value: number, decimals = false): string {
  return '₹' + (decimals ? inr2 : inr).format(value);
}

export function formatBlock(value: number): string {
  return '#' + value.toLocaleString('en-US');
}

export function formatNumber(value: number): string {
  return inr.format(value);
}

/** ₹50 Cr style for large issuance sizes. */
export function formatCr(value: number): string {
  if (value >= 1e7) {
    const cr = value / 1e7;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return formatInr(value);
}

export function formatFx(valueInr: number, currency: 'AED' | 'USD'): string {
  const v = valueInr / FX[currency];
  return `${currency} ${v.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: v < 100 ? 2 : 0 })}`;
}

export function fxLine(asset: Asset, valueInr: number): string | null {
  if (asset.country !== 'AE') return null;
  return `≈ ${formatFx(valueInr, 'AED')} · ${formatFx(valueInr, 'USD')}`;
}

export function shortHash(hash: string, head = 6, tail = 4): string {
  if (!hash.startsWith('0x') || hash.length <= head + tail + 2) return hash;
  return `${hash.slice(0, head + 2)}…${hash.slice(-tail)}`;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function timeAgo(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

export const JURISDICTION_LABEL: Record<Jurisdiction, string> = {
  GIFT_IFSC: 'GIFT IFSC (India)',
  VARA: 'VARA (Dubai)',
  ADGM: 'ADGM (Abu Dhabi)',
};

export const JURISDICTION_SHORT: Record<Jurisdiction, string> = {
  GIFT_IFSC: 'GIFT IFSC',
  VARA: 'VARA',
  ADGM: 'ADGM',
};

export const CLASS_FILTERS: { label: string; value: AssetClass | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Bonds', value: 'Bond' },
  { label: 'Real Estate', value: 'Real Estate' },
  { label: 'Gold', value: 'Gold' },
  { label: 'T-Bills', value: 'T-Bill' },
];

export const EVENT_LABEL: Record<LedgerEventType, string> = {
  MINT: 'Mint',
  INVEST: 'Investment',
  TRANSFER: 'Transfer',
  TRANSFER_BLOCKED: 'Transfer blocked',
  APPROVE: 'Asset approved',
  REJECT: 'Asset rejected',
  KYC_VERIFIED: 'KYC verified',
  KYC_REJECTED: 'KYC rejected',
  SANCTIONS_CLEARED: 'Sanctions cleared',
  WALLET_FROZEN: 'Wallet frozen',
  ASSET_SUBMITTED: 'Asset submitted',
  LEGAL_VERIFIED: 'Legal verified',
  DISTRIBUTION: 'Distribution',
  CONTROL_UPDATED: 'Control updated',
  DOC_ANCHORED: 'Document anchored',
};
