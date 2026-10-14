import {
  ArrowLeftRight,
  Blocks,
  Building2,
  Coins,
  Compass,
  FileText,
  Home,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { ComplianceTab, InvestorTab, IssuerTab, Role } from './types';

export interface NavItem<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

export const ROLE_LABEL: Record<Role, string> = {
  investor: 'Investor',
  issuer: 'Issuer',
  compliance: 'Compliance',
};

export const INVESTOR_TABS: NavItem<InvestorTab>[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'holdings', label: 'Holdings', icon: Wallet },
  { id: 'me', label: 'Me', icon: UserRound },
];

export const ISSUER_TABS: NavItem<IssuerTab>[] = [
  { id: 'assets', label: 'Assets', icon: Building2 },
  { id: 'investors', label: 'Investors', icon: Users },
  { id: 'tokens', label: 'Tokens', icon: Coins },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export const COMPLIANCE_TABS: NavItem<ComplianceTab>[] = [
  { id: 'overview', label: 'Overview', icon: ShieldCheck },
  { id: 'controls', label: 'Controls', icon: SlidersHorizontal },
  { id: 'explorer', label: 'Explorer', icon: Blocks },
];
