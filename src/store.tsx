import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { fakeAddress, newId, nextBlock, submitTx, type Receipt } from './chain';
import {
  ABC_ISSUER_ID,
  COMPLIANCE_WALLET,
  IDENTITY_REGISTRY,
  ISSUER_TREASURY,
  PRIYA_ID,
  RAHUL_ID,
  STATE_VERSION,
  createSeed,
} from './seed';
import type {
  ActionStatus,
  Asset,
  AssetClass,
  ControlKey,
  Investor,
  Jurisdiction,
  LedgerEvent,
  PendingAction,
  State,
  UiState,
} from './types';
import { formatCr, formatInr, shortHash } from './format';

const STORAGE_KEY = 'ousia-demo-state';

export const LOCKED_CONTROLS: ControlKey[] = ['kycAml', 'auditTrail'];

export const CONTROL_LABEL: Record<ControlKey, string> = {
  kycAml: 'KYC / AML',
  investorEligibility: 'Investor eligibility',
  issuerEligibility: 'Issuer eligibility',
  txMonitoring: 'Transaction monitoring',
  walletScreening: 'Wallet screening',
  auditTrail: 'Audit trail',
};

export const BLOCKED_KYC_MESSAGE =
  'Transfer blocked: recipient has not completed KYC (rule enforced by the token, ERC-3643 style)';

function loadState(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed && parsed.version === STATE_VERSION && Array.isArray(parsed.ledger)) return parsed;
    }
  } catch {
    // Corrupt or unavailable storage: fall back to the seed.
  }
  return createSeed();
}

export interface Toast {
  id: string;
  tone: 'success' | 'error' | 'info';
  title: string;
  body?: string;
  txHash?: string;
}

export interface NewAssetInput {
  name: string;
  assetClass: AssetClass;
  jurisdiction: Jurisdiction;
  sizeCr: number;
  yieldPct: number | null;
}

type EventInput = Omit<LedgerEvent, 'id' | 'txHash' | 'block' | 'timestamp' | 'gasUsed' | 'durationMs'>;

interface Store {
  state: State;
  priya: Investor;
  rahul: Investor;
  assetById: (id: string | null | undefined) => Asset | undefined;
  setUi: (patch: Partial<UiState>) => void;
  invest: (assetId: string, tokens: number) => Promise<LedgerEvent>;
  transfer: (assetId: string, toInvestorId: string, tokens: number) => Promise<LedgerEvent>;
  resolveAction: (actionId: string, decision: Exclude<ActionStatus, 'PENDING'>) => Promise<LedgerEvent>;
  reopenAction: (actionId: string) => void;
  completeLegal: (assetId: string) => Promise<LedgerEvent>;
  issueTokens: (assetId: string) => Promise<LedgerEvent>;
  submitAsset: (input: NewAssetInput) => Promise<Asset>;
  uploadDoc: (assetId: string, fileName: string) => Promise<LedgerEvent>;
  toggleControl: (key: ControlKey) => Promise<LedgerEvent | null>;
  addFunds: (amount: number) => void;
  markAuditViewed: () => void;
  resetDemo: () => void;
  resetKey: number;
  txDrawer: string | null;
  openTx: (hash: string | null) => void;
  demoOpen: boolean;
  setDemoOpen: (open: boolean) => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(loadState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const [resetKey, setResetKey] = useState(0);
  const [txDrawer, setTxDrawer] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('demo') === '1';
    } catch {
      return false;
    }
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked: the demo keeps working in memory.
    }
  }, [state]);

  const mutate = useCallback((fn: (draft: State) => void) => {
    setState((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = newId('t');
      setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast],
  );

  /** Builds a ledger event from a receipt; the caller appends it inside its own mutation. */
  const buildEvent = useCallback((receipt: Receipt, input: EventInput): LedgerEvent => {
    return {
      ...input,
      id: receipt.txHash.slice(2, 14),
      txHash: receipt.txHash,
      block: nextBlock(stateRef.current.ledger),
      timestamp: receipt.timestamp,
      gasUsed: receipt.gasUsed,
      durationMs: receipt.durationMs,
    };
  }, []);

  const setUi = useCallback((patch: Partial<UiState>) => mutate((d) => Object.assign(d.ui, patch)), [mutate]);

  const find = <T extends { id: string }>(list: T[], id: string): T => {
    const item = list.find((x) => x.id === id);
    if (!item) throw new Error(`Unknown id ${id}`);
    return item;
  };

  const invest = useCallback(
    async (assetId: string, tokens: number) => {
      const s = stateRef.current;
      const asset = find(s.assets, assetId);
      const investor = find(s.investors, PRIYA_ID);
      const amount = tokens * asset.pricePerToken;
      if (amount > investor.balance) throw new Error('Insufficient balance');
      const receipt = await submitTx();
      const ev = buildEvent(receipt, {
        type: 'INVEST',
        from: ISSUER_TREASURY[asset.issuerId] ?? asset.contractAddress,
        fromLabel: `${asset.issuer} treasury`,
        to: investor.wallet,
        toLabel: investor.name,
        assetId,
        tokens,
        amountInr: amount,
        status: 'CONFIRMED',
        jurisdiction: asset.jurisdiction,
        memo: `Atomic DvP settlement: ${formatInr(amount)} for ${tokens} ${asset.symbol}`,
        checks: [
          { rule: 'Identity registry: investor verified', passed: true, detail: `isVerified(${shortHash(investor.wallet)}) = true` },
          { rule: 'Sanctions screening', passed: true, detail: 'No match on OFAC, UN, EU and UAE lists' },
          { rule: 'Jurisdiction rule', passed: true, detail: 'IN resident → permitted via LRS route' },
          { rule: 'Investor limit', passed: true, detail: 'Within per-investor and LRS limits' },
        ],
      });
      mutate((d) => {
        const a = find(d.assets, assetId);
        const inv = find(d.investors, PRIYA_ID);
        inv.balance -= amount;
        a.tokensSold += tokens;
        const h = d.holdings.find((x) => x.investorId === PRIYA_ID && x.assetId === assetId);
        if (h) {
          h.tokens += tokens;
          h.costBasis += amount;
          h.txHashes.push(ev.txHash);
        } else {
          a.investorsCount += 1;
          d.holdings.push({ investorId: PRIYA_ID, assetId, tokens, costBasis: amount, txHashes: [ev.txHash] });
        }
        d.ledger.push(ev);
      });
      return ev;
    },
    [buildEvent, mutate],
  );

  const transfer = useCallback(
    async (assetId: string, toInvestorId: string, tokens: number) => {
      const s = stateRef.current;
      const asset = find(s.assets, assetId);
      const sender = find(s.investors, PRIYA_ID);
      const recipient = find(s.investors, toInvestorId);
      const receipt = await submitTx();
      const recipientOk = recipient.kyc === 'VERIFIED';
      const checks = [
        { rule: 'Identity registry: sender verified', passed: true, detail: `isVerified(${shortHash(sender.wallet)}) = true` },
        {
          rule: 'Identity registry: recipient verified',
          passed: recipientOk,
          detail: `isVerified(${shortHash(recipient.wallet)}) = ${recipientOk}`,
        },
        { rule: 'Country restriction', passed: true, detail: 'IN → IN permitted' },
        { rule: 'Wallet screening', passed: true, detail: 'Recipient wallet not on any watch list' },
      ];
      const ev = buildEvent(receipt, {
        type: recipientOk ? 'TRANSFER' : 'TRANSFER_BLOCKED',
        from: sender.wallet,
        fromLabel: sender.name,
        to: recipient.wallet,
        toLabel: recipient.name,
        assetId,
        tokens,
        amountInr: tokens * asset.pricePerToken,
        status: recipientOk ? 'CONFIRMED' : 'BLOCKED',
        jurisdiction: asset.jurisdiction,
        memo: recipientOk ? `Peer transfer of ${tokens} ${asset.symbol}` : BLOCKED_KYC_MESSAGE,
        checks,
      });
      mutate((d) => {
        if (recipientOk) {
          const a = find(d.assets, assetId);
          const from = d.holdings.find((x) => x.investorId === PRIYA_ID && x.assetId === assetId);
          if (from) {
            const share = from.tokens > 0 ? from.costBasis * (tokens / from.tokens) : 0;
            from.tokens -= tokens;
            from.costBasis -= share;
            from.txHashes.push(ev.txHash);
          }
          d.holdings = d.holdings.filter((x) => x.tokens > 0);
          const to = d.holdings.find((x) => x.investorId === toInvestorId && x.assetId === assetId);
          if (to) {
            to.tokens += tokens;
            to.costBasis += tokens * a.pricePerToken;
            to.txHashes.push(ev.txHash);
          } else {
            a.investorsCount += 1;
            d.holdings.push({
              investorId: toInvestorId,
              assetId,
              tokens,
              costBasis: tokens * a.pricePerToken,
              txHashes: [ev.txHash],
            });
          }
          if (from && from.tokens === 0) a.investorsCount = Math.max(0, a.investorsCount - 1);
        }
        d.ledger.push(ev);
      });
      return ev;
    },
    [buildEvent, mutate],
  );

  const resolveAction = useCallback(
    async (actionId: string, decision: Exclude<ActionStatus, 'PENDING'>) => {
      const s = stateRef.current;
      const action = find(s.actions, actionId);
      const approve = decision === 'APPROVED';
      const receipt = await submitTx();
      let input: EventInput;
      if (action.kind === 'ASSET_APPROVAL') {
        const asset = find(s.assets, action.refId);
        input = {
          type: approve ? 'APPROVE' : 'REJECT',
          from: COMPLIANCE_WALLET,
          fromLabel: 'OUSIA Compliance',
          to: ISSUER_TREASURY[asset.issuerId] ?? asset.contractAddress,
          toLabel: asset.issuer,
          assetId: asset.id,
          status: 'CONFIRMED',
          jurisdiction: asset.jurisdiction,
          memo: approve ? `Issuance approved for ${asset.name}` : `Issuance rejected for ${asset.name}; issuer may resubmit`,
        };
      } else if (action.kind === 'KYC') {
        const inv = find(s.investors, action.refId);
        input = {
          type: approve ? 'KYC_VERIFIED' : 'KYC_REJECTED',
          from: COMPLIANCE_WALLET,
          fromLabel: 'OUSIA Compliance',
          to: inv.wallet,
          toLabel: inv.name,
          status: 'CONFIRMED',
          jurisdiction: inv.jurisdiction,
          memo: approve
            ? `Identity registry: claim added for ${inv.name} (KYC, country = ${inv.country})`
            : `KYC rejected for ${inv.name}; re-submission requested`,
        };
      } else {
        input = {
          type: approve ? 'SANCTIONS_CLEARED' : 'WALLET_FROZEN',
          from: COMPLIANCE_WALLET,
          fromLabel: 'OUSIA Compliance',
          to: IDENTITY_REGISTRY,
          toLabel: 'User #2001',
          status: 'CONFIRMED',
          jurisdiction: action.jurisdiction,
          memo: approve ? 'False positive: name match cleared, wallet released' : 'Wallet frozen, STR filed with regulator',
        };
      }
      const ev = buildEvent(receipt, input);
      mutate((d) => {
        const a = find(d.actions, actionId);
        a.status = decision;
        a.resolvedAt = receipt.timestamp;
        a.txHash = ev.txHash;
        if (a.kind === 'ASSET_APPROVAL') find(d.assets, a.refId).status = approve ? 'APPROVED' : 'REJECTED';
        if (a.kind === 'KYC') find(d.investors, a.refId).kyc = approve ? 'VERIFIED' : 'REJECTED';
        d.ledger.push(ev);
      });
      return ev;
    },
    [buildEvent, mutate],
  );

  const reopenAction = useCallback(
    (actionId: string) =>
      mutate((d) => {
        const a = find(d.actions, actionId);
        a.status = 'PENDING';
        a.resolvedAt = undefined;
        a.txHash = undefined;
        a.createdAt = Date.now();
        if (a.kind === 'ASSET_APPROVAL') find(d.assets, a.refId).status = 'IN_REVIEW';
        if (a.kind === 'KYC') find(d.investors, a.refId).kyc = 'PENDING';
      }),
    [mutate],
  );

  const completeLegal = useCallback(
    async (assetId: string) => {
      const asset = find(stateRef.current.assets, assetId);
      const receipt = await submitTx();
      const ev = buildEvent(receipt, {
        type: 'LEGAL_VERIFIED',
        from: COMPLIANCE_WALLET,
        fromLabel: 'Legal counsel (panel)',
        to: ISSUER_TREASURY[asset.issuerId],
        toLabel: asset.issuer,
        assetId,
        status: 'CONFIRMED',
        jurisdiction: asset.jurisdiction,
        memo: 'Title and SPV structure verified, legal opinion anchored',
      });
      mutate((d) => {
        const a = find(d.assets, assetId);
        a.status = 'IN_REVIEW';
        if (!a.documents.some((doc) => doc.name === 'Legal Opinion.pdf')) {
          a.documents.push({ id: newId('doc'), name: 'Legal Opinion.pdf', size: '460 KB', addedAt: receipt.timestamp });
        }
        const action: PendingAction = {
          id: newId('act'),
          kind: 'ASSET_APPROVAL',
          title: `Asset approval: ${a.issuer}, ${a.name}`,
          detail: `${formatCr(a.targetSize)} · ${a.assetClass} · legal opinion received`,
          jurisdiction: a.jurisdiction,
          refId: a.id,
          priority: 'Medium',
          createdAt: receipt.timestamp,
          status: 'PENDING',
        };
        d.actions.unshift(action);
        d.ledger.push(ev);
      });
      return ev;
    },
    [buildEvent, mutate],
  );

  const issueTokens = useCallback(
    async (assetId: string) => {
      const asset = find(stateRef.current.assets, assetId);
      if (asset.status !== 'APPROVED') throw new Error('Asset is not approved');
      const receipt = await submitTx();
      const ev = buildEvent(receipt, {
        type: 'MINT',
        from: '0x0000000000000000000000000000000000000000',
        fromLabel: 'Token contract',
        to: ISSUER_TREASURY[asset.issuerId],
        toLabel: `${asset.issuer} treasury`,
        assetId,
        tokens: asset.totalTokens,
        amountInr: asset.totalTokens * asset.pricePerToken,
        status: 'CONFIRMED',
        jurisdiction: asset.jurisdiction,
        memo: `Minted ${asset.totalTokens.toLocaleString('en-IN')} ${asset.symbol}; distribution open`,
      });
      mutate((d) => {
        find(d.assets, assetId).status = 'LIVE';
        d.ledger.push(ev);
      });
      return ev;
    },
    [buildEvent, mutate],
  );

  const submitAsset = useCallback(
    async (input: NewAssetInput) => {
      const receipt = await submitTx();
      const id = newId('asset');
      const targetSize = Math.round(input.sizeCr * 1e7);
      const country = input.jurisdiction === 'GIFT_IFSC' ? 'IN' : 'AE';
      const asset: Asset = {
        id,
        name: input.name.trim(),
        symbol: 'o' + input.name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase(),
        assetClass: input.assetClass,
        country,
        jurisdiction: input.jurisdiction,
        regulator: { GIFT_IFSC: 'IFSCA (GIFT IFSC)', VARA: 'VARA · DLD', ADGM: 'FSRA (ADGM)' }[input.jurisdiction],
        issuer: 'ABC Capital',
        issuerId: ABC_ISSUER_ID,
        location: { GIFT_IFSC: 'India', VARA: 'Dubai, UAE', ADGM: 'Abu Dhabi, UAE' }[input.jurisdiction],
        pricePerToken: 1000,
        minInvestment: 1000,
        yieldPct: input.yieldPct,
        yieldLabel: input.assetClass === 'Real Estate' ? 'Est. rental yield' : 'Yield',
        tenor: input.assetClass === 'T-Bill' ? '91 days' : '5 yr target',
        distribution: input.assetClass === 'Real Estate' ? 'Quarterly rental distribution' : 'Periodic distribution',
        totalTokens: Math.max(1, Math.round(targetSize / 1000)),
        tokensSold: 0,
        targetSize,
        investorsCount: 0,
        status: 'SUBMITTED',
        description: `${input.assetClass} offering submitted by ABC Capital. Pending legal verification and compliance review.`,
        highlights: [],
        documents: [{ id: newId('doc'), name: 'Issuance Application.pdf', size: '320 KB', addedAt: receipt.timestamp }],
        contractAddress: fakeAddress(),
        fxCurrency: country === 'AE' ? (input.jurisdiction === 'VARA' ? 'AED' : 'USD') : undefined,
        submittedAt: receipt.timestamp,
      };
      const ev = buildEvent(receipt, {
        type: 'ASSET_SUBMITTED',
        from: ISSUER_TREASURY[ABC_ISSUER_ID],
        fromLabel: 'ABC Capital',
        to: COMPLIANCE_WALLET,
        toLabel: 'OUSIA Compliance',
        assetId: id,
        status: 'CONFIRMED',
        jurisdiction: input.jurisdiction,
        memo: 'Issuance application filed, document hashes anchored',
      });
      mutate((d) => {
        d.assets.push(asset);
        d.ledger.push(ev);
        d.ui.issuerAssetId = id;
      });
      return asset;
    },
    [buildEvent, mutate],
  );

  const uploadDoc = useCallback(
    async (assetId: string, fileName: string) => {
      const asset = find(stateRef.current.assets, assetId);
      const receipt = await submitTx();
      const ev = buildEvent(receipt, {
        type: 'DOC_ANCHORED',
        from: ISSUER_TREASURY[asset.issuerId],
        fromLabel: asset.issuer,
        to: asset.contractAddress,
        toLabel: `${asset.symbol} document registry`,
        assetId,
        status: 'CONFIRMED',
        jurisdiction: asset.jurisdiction,
        memo: `SHA-256 of "${fileName}" anchored`,
      });
      mutate((d) => {
        find(d.assets, assetId).documents.push({
          id: newId('doc'),
          name: fileName,
          size: `${200 + Math.floor(Math.random() * 1800)} KB`,
          addedAt: receipt.timestamp,
        });
        d.ledger.push(ev);
      });
      return ev;
    },
    [buildEvent, mutate],
  );

  const toggleControl = useCallback(
    async (key: ControlKey) => {
      if (LOCKED_CONTROLS.includes(key)) return null;
      const next = !stateRef.current.controls[key];
      const receipt = await submitTx();
      const ev = buildEvent(receipt, {
        type: 'CONTROL_UPDATED',
        from: COMPLIANCE_WALLET,
        fromLabel: 'OUSIA Compliance',
        to: IDENTITY_REGISTRY,
        toLabel: 'Compliance module',
        status: 'CONFIRMED',
        jurisdiction: 'GIFT_IFSC',
        memo: `${CONTROL_LABEL[key]} ${next ? 'enabled' : 'disabled'}`,
      });
      mutate((d) => {
        d.controls[key] = next;
        d.ledger.push(ev);
      });
      return ev;
    },
    [buildEvent, mutate],
  );

  const addFunds = useCallback(
    (amount: number) => mutate((d) => void (find(d.investors, PRIYA_ID).balance += amount)),
    [mutate],
  );

  const markAuditViewed = useCallback(() => mutate((d) => void (d.demo.auditViewed = true)), [mutate]);

  const resetDemo = useCallback(() => {
    const fresh = createSeed();
    setState(fresh);
    setTxDrawer(null);
    setResetKey((k) => k + 1);
    setToasts([]);
    toast({ tone: 'info', title: 'Demo reset', body: 'Seed data restored.' });
  }, [toast]);

  const value = useMemo<Store>(() => {
    const priya = state.investors.find((i) => i.id === PRIYA_ID)!;
    const rahul = state.investors.find((i) => i.id === RAHUL_ID)!;
    return {
      state,
      priya,
      rahul,
      assetById: (id) => (id ? state.assets.find((a) => a.id === id) : undefined),
      setUi,
      invest,
      transfer,
      resolveAction,
      reopenAction,
      completeLegal,
      issueTokens,
      submitAsset,
      uploadDoc,
      toggleControl,
      addFunds,
      markAuditViewed,
      resetDemo,
      resetKey,
      txDrawer,
      openTx: setTxDrawer,
      demoOpen,
      setDemoOpen,
      toasts,
      toast,
      dismissToast,
    };
  }, [
    state,
    setUi,
    invest,
    transfer,
    resolveAction,
    reopenAction,
    completeLegal,
    issueTokens,
    submitAsset,
    uploadDoc,
    toggleControl,
    addFunds,
    markAuditViewed,
    resetDemo,
    resetKey,
    txDrawer,
    demoOpen,
    toasts,
    toast,
    dismissToast,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** Compliance KPIs, optionally narrowed to one jurisdiction. */
export function complianceMetrics(state: State, jur: Jurisdiction | 'ALL') {
  const jurs: Jurisdiction[] = jur === 'ALL' ? ['GIFT_IFSC', 'VARA', 'ADGM'] : [jur];
  const inJur = (j: Jurisdiction) => jurs.includes(j);
  const sum = (rec: Record<Jurisdiction, number>) => jurs.reduce((n, j) => n + rec[j], 0);
  const open = state.actions.filter((a) => a.status === 'PENDING' && inJur(a.jurisdiction));
  const kycApproved = state.actions.filter((a) => a.kind === 'KYC' && a.status === 'APPROVED' && inJur(a.jurisdiction)).length;
  return {
    investors: sum(state.baseline.investors) + kycApproved,
    pendingReviews: sum(state.baseline.reviews) + open.length,
    alerts: sum(state.baseline.alerts) + open.filter((a) => a.kind === 'SANCTIONS').length,
    blocked: state.ledger.filter((e) => e.status === 'BLOCKED' && inJur(e.jurisdiction)).length,
    backgroundReviews: sum(state.baseline.reviews),
  };
}
