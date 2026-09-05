/** open.er-api.com is free and needs no API key, which keeps this from
 *  becoming a second key to manage alongside Finnhub. */
const FX_URL = "https://open.er-api.com/v6/latest/USD";

/**
 * Today's USD→PKR rate, or undefined if the lookup fails. Callers keep the
 * stored rate on failure — a stale rate is far better than a broken dashboard,
 * and the rate is editable by hand regardless.
 */
export async function fetchUsdPkrRate(): Promise<number | undefined> {
  try {
    const res = await fetch(FX_URL);
    if (!res.ok) return undefined;

    const data = (await res.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.PKR;
    return typeof rate === "number" && rate > 0 ? rate : undefined;
  } catch {
    return undefined;
  }
}
