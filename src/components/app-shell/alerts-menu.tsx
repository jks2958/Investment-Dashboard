import { Link } from "wouter";
import { Bell, Check } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCommitments } from "@/hooks/use-commitments";
import { useHoldings } from "@/hooks/use-holdings";
import { usePrices } from "@/hooks/use-prices";
import { useWishlist } from "@/hooks/use-wishlist";
import { buildAlerts } from "@/lib/alerts";
import { cn } from "@/lib/utils";

const TONE_CLASS = {
  positive: "text-positive",
  warning: "text-warning",
  neutral: "text-muted-foreground",
} as const;

/**
 * The bell, which until now was a button that did nothing.
 *
 * Everything it shows is derived from queries the dashboard has already made,
 * so opening it costs no extra requests and the badge is accurate the moment
 * the page settles.
 */
export function AlertsMenu() {
  const { data: wishlist } = useWishlist();
  const { data: prices } = usePrices();
  const { data: commitments } = useCommitments();
  const { data: holdings } = useHoldings();

  const alerts = buildAlerts({
    wishlist: wishlist ?? [],
    prices: prices ?? [],
    commitments: commitments ?? [],
    holdings: holdings ?? [],
  });

  return (
    <Popover>
      <PopoverTrigger
        aria-label={alerts.length > 0 ? `Alerts (${alerts.length})` : "Alerts"}
        className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="size-4.5" />
        {alerts.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <p className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">Alerts</p>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
            <Check className="size-4 text-positive" />
            Nothing needs your attention.
          </div>
        ) : (
          <ul>
            {alerts.map((alert) => (
              <li key={alert.id}>
                <Link
                  href={alert.href}
                  className="block rounded-lg px-2 py-2 hover:bg-accent"
                >
                  <p className={cn("text-sm font-medium", TONE_CLASS[alert.tone])}>
                    {alert.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{alert.detail}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
