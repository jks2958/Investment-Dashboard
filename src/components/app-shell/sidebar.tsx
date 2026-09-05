import * as React from "react";
import { Link, useLocation } from "wouter";
import {
  Bookmark,
  ChevronRight,
  Landmark,
  Layers,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings as SettingsIcon,
  User,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { usePortfolioTotals } from "@/hooks/use-portfolio-totals";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-nav-active font-semibold text-nav-active-foreground"
          : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { data: profile } = useProfile();
  const { netWorth, totalDebt, netWorthDeltaPct } = usePortfolioTotals();

  const investmentsOpen =
    location.startsWith("/investments") || location === "/investments";
  const [otherOpen, setOtherOpen] = React.useState(investmentsOpen);

  React.useEffect(() => {
    if (investmentsOpen) setOtherOpen(true);
  }, [investmentsOpen]);

  return (
    <aside
      className={cn(
        "flex w-full flex-col justify-between border-r border-border bg-sidebar p-5 text-sidebar-foreground",
        className,
      )}
    >
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl font-semibold">{profile?.name ?? "Investor"}!</h1>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground">Net Worth</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-3xl font-semibold text-primary">
              {formatCurrency(netWorth)}
            </span>
            {netWorthDeltaPct !== undefined && (
              <span className="rounded-full bg-positive/15 px-2 py-0.5 text-xs font-medium text-positive">
                {formatPercent(netWorthDeltaPct)}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totalDebt > 0 ? `after ${formatCurrency(totalDebt)} owed` : "vs last month"}
          </p>
        </div>

        <nav className="mt-8 space-y-1">
          <NavLink
            href="/"
            icon={LayoutDashboard}
            label="Dashboard"
            active={location === "/"}
          />
          <NavLink
            href="/stocks"
            icon={LineChart}
            label="Stocks Portfolio"
            active={location === "/stocks"}
          />

          <button
            type="button"
            onClick={() => setOtherOpen((o) => !o)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              investmentsOpen
                ? "bg-nav-active font-semibold text-nav-active-foreground"
                : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Layers className="size-4.5 shrink-0" />
            <span className="flex-1 text-left">Other Investments</span>
            <ChevronRight
              className={cn("size-4 transition-transform", otherOpen && "rotate-90")}
            />
          </button>
          {otherOpen && (
            <div className="ml-4 space-y-1 border-l border-border pl-4">
              <NavLink
                href="/investments/funds"
                icon={Layers}
                label="Funds"
                active={location === "/investments/funds"}
              />
              <NavLink
                href="/investments/crypto"
                icon={Layers}
                label="Crypto"
                active={location === "/investments/crypto"}
              />
            </div>
          )}

          <NavLink
            href="/income-expense"
            icon={Wallet}
            label="Income / Expense"
            active={location === "/income-expense"}
          />
          <NavLink
            href="/liabilities"
            icon={Landmark}
            label="Liabilities"
            active={location === "/liabilities"}
          />
          <NavLink
            href="/wishlist"
            icon={Bookmark}
            label="Wishlist"
            active={location === "/wishlist"}
          />
        </nav>
      </div>

      <div className="space-y-1 border-t border-border pt-4">
        <NavLink href="/account" icon={User} label="Account" active={location === "/account"} />
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="size-4.5 shrink-0" />
          Log Out
        </button>
        <NavLink
          href="/settings"
          icon={SettingsIcon}
          label="Settings"
          active={location === "/settings"}
        />
      </div>
    </aside>
  );
}
