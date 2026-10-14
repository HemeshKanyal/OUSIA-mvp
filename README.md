# OUSIA MVP: pitch demo

OUSIA (Open Unified Settlement Infrastructure for Assets) is regulated, 24x7, cross-border settlement infrastructure for tokenised real-world assets, starting with India (GIFT City / IFSCA) and the UAE (VARA / DLD).

This repository is a **fully simulated** demo web app. There is no backend, no real blockchain, no real KYC and no real payments. All state lives in the browser (`localStorage`) and can be restored with **Reset demo**.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Open `http://localhost:5173/?demo=1` to start with the demo script visible (or click the **?** icon in the top bar).

## Build and verify

```bash
npm run build        # type-checks and builds to dist/
npm run e2e          # runs the 8-step demo loop at 375px and 1440px, plus layout checks at 375 / 768 / 1440
```

`npm run e2e` needs Google Chrome installed (it uses Playwright with `channel: 'chrome'`). It starts its own preview server on port 4317 and saves screenshots to `screenshots/`.

## Deploy to Vercel

Option A, dashboard:
1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel detects Vite automatically (build `npm run build`, output `dist`). Click **Deploy**.

Option B, CLI:
```bash
npm i -g vercel
vercel           # first deploy (preview URL)
vercel --prod    # production URL
```

`vercel.json` rewrites every path to `index.html`, so `?demo=1` and refreshes always work.

## The demo loop

1. **Investor:** invest ₹5,000 in Dubai Marina. It settles with a tx hash and block number.
2. **Investor:** Holdings → Transfer to Rahul. It is **blocked** (recipient has not completed KYC).
3. **Compliance → Explorer:** the purchase and the blocked transfer (in red) are in the audit log.
4. **Compliance → Overview:** approve "Asset approval: ABC Capital, Mumbai Commercial Property".
5. **Issuer → Assets:** the stepper has advanced. Click **Issue tokens** (mints 5,00,000 oBKC).
6. **Investor → Explore:** Mumbai Commercial Property is LIVE. Invest in it.
7. **Compliance:** approve "Investor KYC: user #1928" (Rahul).
8. **Investor:** transfer to Rahul again. It now succeeds.

The demo script panel ticks each step off automatically. Its **Go** buttons jump straight to the right screen.

## Project layout

```
src/
  chain.ts        simulated chain: fake tx hashes, ever-increasing blocks, 1.2s confirmation
  seed.ts         seed assets, investors, pending actions and ledger history
  store.tsx       single app store (React context) persisted to localStorage, plus all actions
  demo.ts         the 8 demo steps and how each one is detected as complete
  components/     layout, shared UI, audit table, tx drawer, demo panel
  screens/
    investor/     Home, Explore, Asset detail, Invest flow, Holdings, Transfer, Me
    issuer/       Assets (workflow stepper, documents, new asset), Investors, Tokens, Transactions, Reports
    compliance/   Overview (KPIs, pending actions, rule sets), Controls, Explorer
scripts/e2e.mjs   end-to-end check of the demo loop
```

## Notes

- Fonts (Inter) and icons (lucide-react) are bundled, so the app makes no external requests and works offline once loaded.
- KYC/AML and Audit trail controls are locked on purpose, so the blocked-transfer story cannot be broken on stage.
- If anything ever looks wrong, click **Reset demo** (top bar, or Me → Reset demo).
