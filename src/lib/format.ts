export type Currency = "USD" | "PKR";

type MoneyConfig = {
  /** What amounts are displayed in. Everything is *stored* in USD. */
  currency: Currency;
  usdPkrRate: number;
};

const LOCALE: Record<Currency, string> = { USD: "en-US", PKR: "en-PK" };

// Module-level rather than threaded through props: formatCurrency is called in
// 80-odd places and its signature is worth keeping. Changing this alone would
// not re-render anything, so CurrencyBridge in App.tsx remounts the app
// subtree when the currency changes — see the note there.
let config: MoneyConfig = { currency: "USD", usdPkrRate: 280 };

export function setMoneyConfig(next: MoneyConfig): void {
  config = next;
}

export function getMoneyConfig(): MoneyConfig {
  return config;
}

export function convertFromUsd(usdValue: number, currency: Currency, rate: number): number {
  return currency === "PKR" ? usdValue * rate : usdValue;
}

function digitsFor(value: number): number {
  // Magnitude, not sign: a negative net worth should read "-$93,978", not
  // "-$93,978.00" while positive amounts of the same size drop the cents.
  return Math.abs(value) >= 1000 ? 0 : 2;
}

/** Takes a USD amount and renders it in the active display currency. */
export function formatCurrency(usdValue: number): string {
  return formatInCurrency(usdValue, config.currency);
}

/** Renders a USD amount in a specific currency, whatever the active one is —
 *  used for the "equivalent in the other currency" line. */
export function formatInCurrency(usdValue: number, currency: Currency): string {
  const value = convertFromUsd(usdValue, currency, config.usdPkrRate);
  return new Intl.NumberFormat(LOCALE[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: digitsFor(value),
  }).format(value);
}

export function formatCompactCurrency(usdValue: number): string {
  const value = convertFromUsd(usdValue, config.currency, config.usdPkrRate);
  return new Intl.NumberFormat(LOCALE[config.currency], {
    style: "currency",
    currency: config.currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
