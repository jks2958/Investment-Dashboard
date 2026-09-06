import type { ComponentType } from "react";

import { ExpensesCard } from "@/components/expenses-card";
import { NetIncomeCard } from "@/components/net-income-card";
import type { WidgetType } from "@/lib/api";
import { HoldingsByTypePage } from "@/pages/holdings-by-type";
import { WishlistPage } from "@/pages/wishlist";
import { AllocationDriftWidget } from "@/widgets/allocation-drift-widget";
import { AllocationWidget } from "@/widgets/allocation-widget";
import { CashAccountsWidget } from "@/widgets/cash-accounts-widget";
import { CashRunwayWidget } from "@/widgets/cash-runway-widget";
import { CommitmentsWidget } from "@/widgets/commitments-widget";
import { DebtPayoffWidget } from "@/widgets/debt-payoff-widget";
import { DebtsWidget } from "@/widgets/debts-widget";
import { GainersLosersWidget } from "@/widgets/gainers-losers-widget";
import {
  MiniCashWidget,
  MiniCryptoWidget,
  MiniFundsWidget,
  MiniStocksWidget,
} from "@/widgets/mini-stat-widgets";
import { NetWorthTrendWidget } from "@/widgets/net-worth-trend-widget";
import { OtherAssetsWidget } from "@/widgets/other-assets-widget";
import { TotalAssetsWidget } from "@/widgets/total-assets-widget";
import { TransactionsWidget } from "@/widgets/transactions-widget";
import { WishlistTargetsWidget } from "@/widgets/wishlist-targets-widget";

function HoldingsStocksWidget() {
  return <HoldingsByTypePage assetType="stock" heading="Stocks Portfolio" />;
}
function HoldingsFundsWidget() {
  return <HoldingsByTypePage assetType="fund" heading="Funds" />;
}
function HoldingsCryptoWidget() {
  return <HoldingsByTypePage assetType="crypto" heading="Crypto" />;
}

export type WidgetDefinition = {
  label: string;
  Component: ComponentType;
  defaultSize: { w: number; h: number };
};

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  "total-assets": {
    label: "Total Assets",
    Component: TotalAssetsWidget,
    defaultSize: { w: 4, h: 6 },
  },
  "net-income": {
    label: "Net Income / Month",
    Component: NetIncomeCard,
    defaultSize: { w: 4, h: 6 },
  },
  expenses: {
    label: "Expenses",
    Component: ExpensesCard,
    defaultSize: { w: 8, h: 8 },
  },
  allocation: {
    label: "Wealth Distribution",
    Component: AllocationWidget,
    defaultSize: { w: 4, h: 10 },
  },
  "mini-cash": {
    label: "Cash (mini)",
    Component: MiniCashWidget,
    defaultSize: { w: 3, h: 5 },
  },
  "mini-stocks": {
    label: "Stocks (mini)",
    Component: MiniStocksWidget,
    defaultSize: { w: 3, h: 5 },
  },
  "mini-funds": {
    label: "Funds (mini)",
    Component: MiniFundsWidget,
    defaultSize: { w: 3, h: 5 },
  },
  "mini-crypto": {
    label: "Crypto (mini)",
    Component: MiniCryptoWidget,
    defaultSize: { w: 3, h: 5 },
  },
  "cash-accounts": {
    label: "Cash Accounts",
    Component: CashAccountsWidget,
    defaultSize: { w: 4, h: 8 },
  },
  "other-assets": {
    label: "Other Assets",
    Component: OtherAssetsWidget,
    defaultSize: { w: 4, h: 8 },
  },
  wishlist: {
    label: "Wishlist",
    Component: WishlistPage,
    defaultSize: { w: 4, h: 8 },
  },
  transactions: {
    label: "Recent Transactions",
    Component: TransactionsWidget,
    defaultSize: { w: 4, h: 8 },
  },
  "holdings-stocks": {
    label: "Stocks Holdings",
    Component: HoldingsStocksWidget,
    defaultSize: { w: 6, h: 8 },
  },
  "holdings-funds": {
    label: "Funds Holdings",
    Component: HoldingsFundsWidget,
    defaultSize: { w: 6, h: 8 },
  },
  "holdings-crypto": {
    label: "Crypto Holdings",
    Component: HoldingsCryptoWidget,
    defaultSize: { w: 6, h: 8 },
  },
  "net-worth-trend": {
    label: "Net Worth Trend",
    Component: NetWorthTrendWidget,
    defaultSize: { w: 8, h: 9 },
  },
  "gainers-losers": {
    label: "Gainers & Losers",
    Component: GainersLosersWidget,
    defaultSize: { w: 4, h: 9 },
  },
  "cash-runway": {
    label: "Cash Runway",
    Component: CashRunwayWidget,
    defaultSize: { w: 4, h: 8 },
  },
  "wishlist-targets": {
    label: "Wishlist Targets",
    Component: WishlistTargetsWidget,
    defaultSize: { w: 4, h: 9 },
  },
  "allocation-drift": {
    label: "Allocation Drift",
    Component: AllocationDriftWidget,
    defaultSize: { w: 6, h: 9 },
  },
  debts: {
    label: "Debts",
    Component: DebtsWidget,
    defaultSize: { w: 4, h: 9 },
  },
  "debt-payoff": {
    label: "Debt Payoff Plan",
    Component: DebtPayoffWidget,
    defaultSize: { w: 4, h: 9 },
  },
  commitments: {
    label: "Future Commitments",
    Component: CommitmentsWidget,
    defaultSize: { w: 4, h: 9 },
  },
};
