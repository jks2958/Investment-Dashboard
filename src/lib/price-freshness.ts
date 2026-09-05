/**
 * How old a cached market price is, in words.
 *
 * The server refreshes anything older than 15 minutes on each holdings read,
 * so a price much older than that means a lookup is failing quietly — a bad
 * API key, a symbol the provider doesn't know, or a rate limit. On a portfolio
 * screen that distinction matters: whether a figure is four minutes or four
 * days old changes what you'd do with it, and until now the age was fetched
 * from the API on every row and shown nowhere.
 */

/** Past this, the refresh cycle has clearly not been running. */
const STALE_AFTER_MS = 60 * 60 * 1000;

export type PriceAge = {
  /** "just now", "12m ago", "3h ago", "2d ago" */
  label: string;
  stale: boolean;
};

export function priceAge(fetchedAt: string | null | undefined): PriceAge | undefined {
  if (!fetchedAt) return undefined;
  const then = new Date(fetchedAt).getTime();
  if (Number.isNaN(then)) return undefined;

  const ms = Math.max(Date.now() - then, 0);
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const label =
    minutes < 2 ? "just now" : minutes < 60 ? `${minutes}m ago` : hours < 24 ? `${hours}h ago` : `${days}d ago`;

  return { label, stale: ms > STALE_AFTER_MS };
}

/** The freshness of a whole list — the oldest price in it, since one stale
 *  row is enough to make the total wrong. */
export function oldestPriceAge(
  rows: { lastPrice: string | null; priceFetchedAt: string | null }[],
): PriceAge | undefined {
  const times = rows
    .filter((r) => r.lastPrice !== null && r.priceFetchedAt !== null)
    .map((r) => new Date(r.priceFetchedAt as string).getTime())
    .filter((t) => !Number.isNaN(t));

  if (times.length === 0) return undefined;
  return priceAge(new Date(Math.min(...times)).toISOString());
}
