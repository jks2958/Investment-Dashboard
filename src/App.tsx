import { QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { Route, Switch, useLocation } from "wouter";

import { AppShell } from "@/components/app-shell/app-shell";
import { PassphraseGate } from "@/components/passphrase-gate";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { AuthProvider, useAuth } from "@/lib/auth";
import { setMoneyConfig } from "@/lib/format";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/lib/theme";
import { AccountPage } from "@/pages/account";
import { DashboardPage } from "@/pages/dashboard";
import { CryptoPage } from "@/pages/investments-crypto";
import { FundsPage } from "@/pages/investments-funds";
import { IncomeExpensePage } from "@/pages/income-expense";
import { LiabilitiesPage } from "@/pages/liabilities";
import { SettingsPage } from "@/pages/settings";
import { StocksPage } from "@/pages/stocks";
import { WishlistPage } from "@/pages/wishlist";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/stocks": "Stocks Portfolio",
  "/investments/funds": "Funds",
  "/investments/crypto": "Crypto",
  "/income-expense": "Income / Expense",
  "/liabilities": "Liabilities & Commitments",
  "/wishlist": "Wishlist",
  "/account": "Account",
  "/settings": "Settings",
};

function AccentSync() {
  const { data: settings } = useDashboardSettings();

  React.useEffect(() => {
    if (settings?.accent) document.documentElement.dataset.accent = settings.accent;
  }, [settings?.accent]);

  return null;
}

/**
 * Keeps the money formatter in step with the saved currency.
 *
 * formatCurrency reads module-level config so its signature stays simple
 * across ~80 call sites, but that means changing it re-renders nothing on its
 * own. Keying the subtree on the currency and rate remounts it when either
 * changes, which guarantees no figure is left rendered in the old currency.
 * Cheap in practice: this only fires when the setting is toggled, and the
 * query cache sits outside the remount so no data is refetched.
 */
function CurrencyBridge({ children }: { children: React.ReactNode }) {
  const { data: settings } = useDashboardSettings();

  const currency = settings?.currency ?? "USD";
  const usdPkrRate = Number(settings?.usdPkrRate ?? 280);

  setMoneyConfig({ currency, usdPkrRate });

  return <React.Fragment key={`${currency}-${usdPkrRate}`}>{children}</React.Fragment>;
}

function Gated() {
  const { status } = useAuth();
  const [location] = useLocation();

  if (status === "loading") return null;
  if (status === "unauthenticated") return <PassphraseGate />;

  // The bridge wraps AppShell, not just the routes: the sidebar renders net
  // worth too, and sitting outside the remount left it in the old currency.
  return (
    <CurrencyBridge>
      <AppShell title={TITLES[location] ?? "Dashboard"}>
        <AccentSync />
        <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/stocks" component={StocksPage} />
        <Route path="/investments/funds" component={FundsPage} />
        <Route path="/investments/crypto" component={CryptoPage} />
        <Route path="/income-expense" component={IncomeExpensePage} />
        <Route path="/liabilities" component={LiabilitiesPage} />
        <Route path="/wishlist" component={WishlistPage} />
        <Route path="/account" component={AccountPage} />
          <Route path="/settings" component={SettingsPage} />
        </Switch>
      </AppShell>
    </CurrencyBridge>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Gated />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
