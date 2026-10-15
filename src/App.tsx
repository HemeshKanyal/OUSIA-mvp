import { useEffect, useRef } from 'react';
import { BottomNav, DemoFooter, Sidebar, TopBar } from './components/Layout';
import { DemoAside, DemoStrip } from './components/DemoPanel';
import { Toasts } from './components/Toasts';
import { TxDrawer } from './components/TxDrawer';
import { useStore } from './store';
import { InvestorApp } from './screens/investor/InvestorApp';
import { IssuerApp } from './screens/issuer/IssuerApp';
import { ComplianceApp } from './screens/compliance/ComplianceApp';

export function App() {
  const { state, resetKey } = useStore();
  const { ui } = state;
  const mainRef = useRef<HTMLElement>(null);
  const tab = ui.role === 'investor' ? `${ui.investorTab}:${ui.investorAssetId}` : ui.role === 'issuer' ? ui.issuerTab : ui.complianceTab;

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [ui.role, tab]);

  return (
    <div className="flex h-[100dvh] flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <TopBar />
      <DemoStrip />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main id="main" ref={mainRef} className="bg-paper min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div key={`${resetKey}-${ui.role}`} className="animate-fade mx-auto w-full max-w-6xl px-4 py-5 md:px-8 md:py-8">
            {ui.role === 'investor' && <InvestorApp />}
            {ui.role === 'issuer' && <IssuerApp />}
            {ui.role === 'compliance' && <ComplianceApp />}
          </div>
        </main>
        <DemoAside />
      </div>
      <DemoFooter />
      <BottomNav />
      <TxDrawer />
      <Toasts />
    </div>
  );
}
