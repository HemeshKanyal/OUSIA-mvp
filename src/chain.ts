/**
 * Simulated settlement chain. Nothing here touches a real network:
 * hashes are random, blocks are derived from the clock, and every
 * transaction resolves after a fixed confirmation delay.
 */
import type { LedgerEvent } from './types';

export const CONFIRM_MS = 1200;
const BLOCK_TIME_MS = 2000;
const GENESIS_BLOCK = 18_204_000;
const GENESIS_TIME = Date.UTC(2026, 9, 1);

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

export function fakeTxHash(): string {
  return '0x' + randomHex(64);
}

export function fakeAddress(): string {
  return '0x' + randomHex(40);
}

export function newId(prefix: string): string {
  return `${prefix}_${randomHex(10)}`;
}

/** Block height grows with wall-clock time, so it keeps counting up across reloads. */
export function currentBlock(now = Date.now()): number {
  return GENESIS_BLOCK + Math.floor((now - GENESIS_TIME) / BLOCK_TIME_MS);
}

/** Next block for a new event, always strictly above anything already in the ledger. */
export function nextBlock(ledger: LedgerEvent[]): number {
  const last = ledger.reduce((max, e) => Math.max(max, e.block), 0);
  return Math.max(last + 1, currentBlock());
}

export interface Receipt {
  txHash: string;
  timestamp: number;
  durationMs: number;
  gasUsed: number;
}

/** Simulates broadcasting a transaction and waiting for confirmation. */
export function submitTx(): Promise<Receipt> {
  const started = Date.now();
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        txHash: fakeTxHash(),
        timestamp: Date.now(),
        durationMs: Math.max(CONFIRM_MS, Date.now() - started),
        gasUsed: 48_000 + Math.floor(Math.random() * 40_000),
      });
    }, CONFIRM_MS);
  });
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
