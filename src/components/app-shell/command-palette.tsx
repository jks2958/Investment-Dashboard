import * as React from "react";
import { useLocation } from "wouter";
import {
  Bookmark,
  Boxes,
  CornerDownLeft,
  Landmark,
  LayoutDashboard,
  LineChart,
  Layers,
  Plus,
  Receipt,
  Search,
  Settings as SettingsIcon,
  User,
} from "lucide-react";

import { CashDialog } from "@/components/cash-dialog";
import { HoldingDialog } from "@/components/holding-dialog";
import { OtherAssetDialog } from "@/components/other-asset-dialog";
import { TransactionDialog } from "@/components/transaction-dialog";
import { WishlistDialog } from "@/components/wishlist-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCashAccounts } from "@/hooks/use-cash";
import { useHoldings } from "@/hooks/use-holdings";
import { useOtherAssets } from "@/hooks/use-other-assets";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

type QuickAction = "holding" | "transaction" | "cash" | "other-asset" | "wishlist";

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: QuickAction;
};

const PAGES: Item[] = [
  { id: "p-dash", label: "Dashboard", group: "Go to", icon: LayoutDashboard, href: "/" },
  { id: "p-stocks", label: "Stocks Portfolio", group: "Go to", icon: LineChart, href: "/stocks" },
  { id: "p-funds", label: "Funds", group: "Go to", icon: Layers, href: "/investments/funds" },
  { id: "p-crypto", label: "Crypto", group: "Go to", icon: Layers, href: "/investments/crypto" },
  { id: "p-income", label: "Income / Expense", group: "Go to", icon: Receipt, href: "/income-expense" },
  { id: "p-liab", label: "Liabilities & Commitments", group: "Go to", icon: Landmark, href: "/liabilities" },
  { id: "p-wish", label: "Wishlist", group: "Go to", icon: Bookmark, href: "/wishlist" },
  { id: "p-account", label: "Account", group: "Go to", icon: User, href: "/account" },
  { id: "p-settings", label: "Settings", group: "Go to", icon: SettingsIcon, href: "/settings" },
];

const ACTIONS: Item[] = [
  { id: "a-holding", label: "Add holding", group: "Add", icon: Plus, action: "holding" },
  { id: "a-tx", label: "Add transaction", group: "Add", icon: Plus, action: "transaction" },
  { id: "a-cash", label: "Add cash account", group: "Add", icon: Plus, action: "cash" },
  { id: "a-other", label: "Add other asset", group: "Add", icon: Plus, action: "other-asset" },
  { id: "a-wish", label: "Add to wishlist", group: "Add", icon: Plus, action: "wishlist" },
];

/** Substring match on label and hint — with a few dozen records at most,
 *  anything cleverer would be harder to predict, not easier to use. */
function matches(item: Item, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return item.label.toLowerCase().includes(q) || (item.hint?.toLowerCase().includes(q) ?? false);
}

/**
 * Replaces a search box that was never wired to anything.
 *
 * On a nine-page app with a few dozen records, jumping straight to a symbol or
 * starting an entry beats navigating the sidebar — so the box searches your own
 * data, not the web.
 */
export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [pendingAction, setPendingAction] = React.useState<QuickAction | undefined>();
  const [, navigate] = useLocation();

  const { data: holdings } = useHoldings();
  const { data: wishlist } = useWishlist();
  const { data: cash } = useCashAccounts();
  const { data: otherAssets } = useOtherAssets();

  /** Every open starts from a blank query, so the palette never reopens
   *  showing the last thing searched for. */
  const setPaletteOpen = React.useCallback((next: boolean) => {
    if (next) {
      setQuery("");
      setActive(0);
    }
    setOpen(next);
  }, []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((wasOpen) => {
          if (!wasOpen) {
            setQuery("");
            setActive(0);
          }
          return !wasOpen;
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const records: Item[] = React.useMemo(() => {
    const rows: Item[] = [];
    for (const h of holdings ?? []) {
      rows.push({
        id: `h-${h.id}`,
        label: h.symbol.toUpperCase(),
        hint: `${h.assetType} · ${Number(h.quantity)} units`,
        group: "Holdings",
        icon: LineChart,
        href:
          h.assetType === "stock"
            ? "/stocks"
            : h.assetType === "fund"
              ? "/investments/funds"
              : "/investments/crypto",
      });
    }
    for (const w of wishlist ?? []) {
      rows.push({
        id: `w-${w.id}`,
        label: w.symbol.toUpperCase(),
        hint: "wishlist",
        group: "Wishlist",
        icon: Bookmark,
        href: "/wishlist",
      });
    }
    for (const c of cash ?? []) {
      rows.push({ id: `c-${c.id}`, label: c.name, hint: "cash account", group: "Accounts", icon: Landmark, href: "/account" });
    }
    for (const a of otherAssets ?? []) {
      rows.push({ id: `o-${a.id}`, label: a.name, hint: "other asset", group: "Accounts", icon: Boxes, href: "/account" });
    }
    return rows;
  }, [holdings, wishlist, cash, otherAssets]);

  const results = React.useMemo(
    () => [...ACTIONS, ...PAGES, ...records].filter((item) => matches(item, query)).slice(0, 12),
    [records, query],
  );

  // A shrinking result list can leave the highlight past the end.
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  function run(item: Item) {
    setOpen(false);
    if (item.action) setPendingAction(item.action);
    else if (item.href) navigate(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) run(item);
    }
  }

  let lastGroup = "";

  return (
    <>
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Search"
        className="flex h-9 items-center gap-2 rounded-full border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-48 lg:w-64"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden md:inline">Search…</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 font-sans text-[10px] lg:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setPaletteOpen}>
        <DialogContent className="top-24 max-w-lg translate-y-0 gap-0 p-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Jump to a page, a holding, or add something…"
              aria-label="Search"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Nothing matches “{query}”.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.map((item, i) => {
                const showGroup = item.group !== lastGroup;
                lastGroup = item.group;
                const Icon = item.icon;
                return (
                  <React.Fragment key={item.id}>
                    {showGroup && (
                      <li className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                        {item.group}
                      </li>
                    )}
                    <li>
                      <button
                        type="button"
                        onClick={() => run(item)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm",
                          i === activeIndex ? "bg-accent" : "hover:bg-accent/60",
                        )}
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{item.label}</span>
                        {item.hint && (
                          <span className="truncate text-xs text-muted-foreground">{item.hint}</span>
                        )}
                        {i === activeIndex && (
                          <CornerDownLeft className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick actions reuse the same forms as the pages they belong to. */}
      {pendingAction === "holding" && (
        <HoldingDialog open onOpenChange={(o) => !o && setPendingAction(undefined)} />
      )}
      {pendingAction === "transaction" && (
        <TransactionDialog open onOpenChange={(o) => !o && setPendingAction(undefined)} />
      )}
      {pendingAction === "cash" && (
        <CashDialog open onOpenChange={(o) => !o && setPendingAction(undefined)} />
      )}
      {pendingAction === "other-asset" && (
        <OtherAssetDialog open onOpenChange={(o) => !o && setPendingAction(undefined)} />
      )}
      {pendingAction === "wishlist" && (
        <WishlistDialog open onOpenChange={(o) => !o && setPendingAction(undefined)} />
      )}
    </>
  );
}
