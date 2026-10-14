// End-to-end check of the 8-step pitch demo loop, plus layout checks at 375 / 768 / 1440 px.
// Usage: npm run build && npm run e2e   (uses the locally installed Google Chrome)
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = 4317;
const BASE = `http://localhost:${PORT}`;
const SHOTS = process.env.SHOTS_DIR ?? 'screenshots';
mkdirSync(SHOTS, { recursive: true });

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
await new Promise((resolve, reject) => {
  server.stdout.on('data', (d) => d.toString().includes(String(PORT)) && resolve());
  server.on('exit', (code) => reject(new Error(`preview exited ${code}`)));
});

const browser = await chromium.launch({ channel: 'chrome', headless: true });
let failures = 0;
const log = (ok, msg) => {
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${msg}`);
};

async function noHorizontalScroll(page, label) {
  const over = await page.evaluate(() => {
    const main = document.querySelector('main');
    return {
      doc: document.documentElement.scrollWidth - window.innerWidth,
      main: main ? main.scrollWidth - main.clientWidth : 0,
    };
  });
  log(over.doc <= 0 && over.main <= 0, `${label}: no horizontal scroll (doc ${over.doc}, main ${over.main})`);
}

async function runLoop(width, height, tag) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(`${BASE}/?demo=1`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const nav = () => page.locator('nav[aria-label="Sections"]:visible');
  const role = (name) => page.getByRole('radio', { name }).locator('visible=true').first().click();
  const tab = (name) => nav().getByRole('button', { name, exact: true }).click();
  const shot = async (name) => {
    await page.waitForTimeout(450);
    await page.screenshot({ path: `${SHOTS}/${tag}-${name}.png` });
  };
  const dialog = () => page.getByRole('dialog');

  async function investIn(assetName, amount) {
    await role('Investor');
    await tab('Explore');
    await page.getByRole('button', { name: `${assetName}, view details` }).click();
    await page.getByRole('button', { name: 'Invest', exact: true }).locator('visible=true').first().click();
    await dialog().getByLabel('Amount (INR)').fill(String(amount));
    await dialog().getByRole('button', { name: 'Check eligibility' }).click();
    await dialog().getByRole('button', { name: 'All checks passed: continue' }).click({ timeout: 5000 });
    await dialog().getByRole('button', { name: /^Confirm/ }).click();
    await dialog().getByText('Settling on-chain…').waitFor();
    await dialog().getByText(/Settled in 1\.2s · 24x7/).waitFor({ timeout: 5000 });
  }

  async function transferToRahul() {
    await role('Investor');
    await tab('Holdings');
    await page.locator('main li', { hasText: 'Dubai Marina Residence' }).getByRole('button', { name: 'Transfer' }).click();
    await dialog().getByRole('button', { name: /^Send/ }).click();
    await dialog().getByText('Checking transfer rules on-chain…').waitFor();
  }

  // 1. Invest ₹5,000 in Dubai Marina
  await shot('01-investor-home');
  await investIn('Dubai Marina Residence, Unit 1204', 5000);
  const hash = await dialog().locator('.break-all.font-mono').first().innerText();
  log(/^0x[0-9a-f]{64}$/.test(hash), `[${tag}] 1. Dubai Marina settled, tx ${hash.slice(0, 12)}…`);
  await shot('02-invest-success');
  await dialog().getByRole('button', { name: 'View holdings' }).click();
  await shot('03-holdings');

  // 2. Transfer to Rahul is blocked
  await transferToRahul();
  await dialog().getByText('Transfer blocked: recipient has not completed KYC (rule enforced by the token, ERC-3643 style)').waitFor({ timeout: 5000 });
  log(true, `[${tag}] 2. Transfer to Rahul blocked with the expected message`);
  await shot('04-transfer-blocked');
  await dialog().getByRole('button', { name: 'Done' }).click();

  // 3. Audit log shows both events
  await role('Compliance');
  await tab('Explorer');
  const blockedRows = await page.getByText('Transfer blocked', { exact: true }).locator('visible=true').count();
  const investRows = await page.getByText('Investment', { exact: true }).locator('visible=true').count();
  log(blockedRows >= 1 && investRows >= 1, `[${tag}] 3. Audit log shows purchase (${investRows}) and blocked transfer (${blockedRows})`);
  await shot('05-explorer');
  await page.getByText('Transfer blocked', { exact: true }).locator('visible=true').first().click();
  await dialog().getByText('Rule engine trace').waitFor();
  await shot('06-tx-drawer-blocked');
  await dialog().getByRole('button', { name: 'Close' }).click();

  // 4. Approve the ABC Capital asset
  await tab('Overview');
  const pendingBefore = await page.locator('p', { hasText: /^Pending reviews$/ }).locator('xpath=../..').locator('p.text-2xl, p.md\\:text-3xl').first().innerText();
  await shot('07-compliance-overview');
  const abc = page.locator('main li', { hasText: 'Asset approval: ABC Capital, Mumbai Commercial Property' });
  await abc.getByRole('button', { name: 'Approve', exact: true }).click();
  await abc.getByText('Approved', { exact: true }).waitFor({ timeout: 5000 });
  const pendingAfter = await page.locator('p', { hasText: /^Pending reviews$/ }).locator('xpath=../..').locator('p.text-2xl, p.md\\:text-3xl').first().innerText();
  log(pendingBefore === '23' && pendingAfter === '22', `[${tag}] 4. ABC asset approved, pending reviews ${pendingBefore} → ${pendingAfter}`);

  // 5. Issuer: stepper advanced, issue tokens
  await role('Issuer');
  await tab('Assets');
  const reviewDone = await page.getByText(/^Complete · /).count();
  log(reviewDone >= 3, `[${tag}] 5a. Stepper shows ${reviewDone} completed steps (submitted, legal, compliance)`);
  await shot('08-issuer-approved');
  await page.getByRole('button', { name: 'Issue tokens', exact: true }).click();
  await page.getByText(/Minting 5,00,000 tokens/).waitFor();
  await page.getByText('Live · distribution open to eligible investors').waitFor({ timeout: 5000 });
  log(true, `[${tag}] 5b. 5,00,000 oBKC minted, asset live`);
  await shot('09-issuer-live');

  // 6. Investor buys Mumbai BKC
  await investIn('Mumbai Commercial Property, BKC', 5000);
  log(true, `[${tag}] 6. Mumbai Commercial Property investment settled`);
  await dialog().getByRole('button', { name: 'View holdings' }).click();
  await role('Issuer');
  await tab('Investors');
  const capRow = await page.getByText('Priya S.').count();
  log(capRow >= 1, `[${tag}] 6b. Priya appears in the ABC Capital cap table`);
  await shot('10-issuer-cap-table');

  // 7. Approve Rahul's KYC
  await role('Compliance');
  await tab('Overview');
  const kyc = page.locator('main li', { hasText: 'Investor KYC: user #1928' });
  await kyc.getByRole('button', { name: 'Approve', exact: true }).click();
  await kyc.getByText('Approved', { exact: true }).waitFor({ timeout: 5000 });
  log(true, `[${tag}] 7. Rahul's KYC approved`);

  // 8. Transfer to Rahul now succeeds
  await transferToRahul();
  await dialog().getByText('Transfer settled').waitFor({ timeout: 5000 });
  log(true, `[${tag}] 8. Transfer to Rahul succeeded`);
  await shot('11-transfer-success');
  await dialog().getByRole('button', { name: 'Done' }).click();

  const progress = await page.getByTestId('demo-progress').locator('visible=true').first().innerText();
  log(progress === '8/8', `[${tag}] Demo script shows ${progress}`);
  await shot('12-demo-complete');

  // Persistence across reload, then reset
  await page.reload();
  const afterReload = await page.getByTestId('demo-progress').locator('visible=true').first().innerText();
  log(afterReload === '8/8', `[${tag}] State persists across reload (${afterReload})`);
  await page.getByRole('button', { name: 'Reset demo' }).locator('visible=true').first().click();
  await dialog().getByRole('button', { name: 'Reset', exact: true }).click();
  const afterReset = await page.getByTestId('demo-progress').locator('visible=true').first().innerText();
  log(afterReset === '0/8', `[${tag}] Reset restores seed (${afterReset})`);

  log(errors.length === 0, `[${tag}] No console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await context.close();
}

async function layoutSweep(width, height, tag) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const screens = {
    Investor: ['Home', 'Explore', 'Holdings', 'Me'],
    Issuer: ['Assets', 'Investors', 'Tokens', 'Transactions', 'Reports'],
    Compliance: ['Overview', 'Controls', 'Explorer'],
  };
  for (const [r, tabs] of Object.entries(screens)) {
    await page.getByRole('radio', { name: r }).locator('visible=true').first().click();
    for (const t of tabs) {
      await page.locator('nav[aria-label="Sections"]:visible').getByRole('button', { name: t, exact: true }).click();
      await page.waitForTimeout(150);
      await noHorizontalScroll(page, `[${tag}] ${r} / ${t}`);
    }
  }
  await page.getByRole('radio', { name: 'Investor' }).locator('visible=true').first().click();
  await page.locator('nav[aria-label="Sections"]:visible').getByRole('button', { name: 'Explore', exact: true }).click();
  await page.getByRole('button', { name: 'Dubai Marina Residence, Unit 1204, view details' }).click();
  await noHorizontalScroll(page, `[${tag}] Investor / Asset detail`);
  await context.close();
}

try {
  await runLoop(375, 812, 'mobile');
  await runLoop(1440, 900, 'desktop');
  for (const [w, h, tag] of [
    [375, 812, 'w375'],
    [768, 1024, 'w768'],
    [1440, 900, 'w1440'],
  ]) {
    await layoutSweep(w, h, tag);
  }
} catch (e) {
  failures++;
  console.error('✗ Aborted:', e.message);
} finally {
  await browser.close();
  server.kill();
}
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
