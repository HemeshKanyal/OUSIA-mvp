import { useStore } from '../../store';
import { IssuerAssets } from './Assets';
import { IssuerInvestors } from './Investors';
import { IssuerReports } from './Reports';
import { IssuerTokens } from './Tokens';
import { IssuerTransactions } from './Transactions';

export function IssuerApp() {
  const { state } = useStore();
  switch (state.ui.issuerTab) {
    case 'investors':
      return <IssuerInvestors />;
    case 'tokens':
      return <IssuerTokens />;
    case 'transactions':
      return <IssuerTransactions />;
    case 'reports':
      return <IssuerReports />;
    default:
      return <IssuerAssets />;
  }
}
