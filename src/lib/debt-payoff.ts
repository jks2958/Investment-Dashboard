import type { Debt } from "@/lib/api";

/**
 * Amortisation for debts you're already recording.
 *
 * Balance, interest rate and monthly payment are all stored already, which is
 * everything needed to answer the questions that actually change behaviour —
 * when this is gone, what it costs in interest, and which debt to attack first.
 * Nothing here needs new data entry.
 */

/** Guard against a payment that never clears the interest: at that point the
 *  balance grows forever and the loop would never terminate. */
const MAX_MONTHS = 12 * 60; // 60 years

export type PayoffProjection = {
  /** Months until the balance reaches zero. */
  months: number;
  /** YYYY-MM of the final payment. */
  payoffOn: string;
  totalInterest: number;
  totalPaid: number;
  /** True when the payment doesn't cover the monthly interest, so the balance
   *  never falls. Everything else is undefined in that case. */
  neverPaysOff: boolean;
};

function addMonths(from: Date, months: number): string {
  const d = new Date(from.getFullYear(), from.getMonth() + months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Simulates month by month rather than using the closed-form formula: it
 * handles a zero interest rate and a final part-payment without special cases,
 * and 720 iterations is nothing.
 */
export function projectPayoff(
  balance: number,
  annualRatePct: number,
  monthlyPayment: number,
  now = new Date(),
): PayoffProjection | undefined {
  if (balance <= 0 || monthlyPayment <= 0) return undefined;

  const monthlyRate = annualRatePct / 100 / 12;
  let remaining = balance;
  let totalInterest = 0;
  let months = 0;

  while (remaining > 0 && months < MAX_MONTHS) {
    const interest = remaining * monthlyRate;
    // A payment at or below the interest charge leaves the balance flat or
    // rising — worth saying out loud rather than reporting "60 years".
    if (monthlyPayment <= interest) {
      return {
        months: 0,
        payoffOn: "",
        totalInterest: 0,
        totalPaid: 0,
        neverPaysOff: true,
      };
    }
    totalInterest += interest;
    remaining = remaining + interest - monthlyPayment;
    months++;
  }

  return {
    months,
    payoffOn: addMonths(now, months),
    totalInterest,
    totalPaid: balance + totalInterest,
    neverPaysOff: false,
  };
}

export type DebtProjection = {
  debt: Debt;
  balance: number;
  rate: number;
  payment: number;
  projection?: PayoffProjection;
  /** What one extra unit of currency a month is worth — months saved and
   *  interest avoided at +10% of the current payment. */
  extraPaymentSaving?: { extra: number; monthsSaved: number; interestSaved: number };
};

/** Only debts carrying both a rate and a payment can be projected. */
export function projectDebt(debt: Debt, now = new Date()): DebtProjection {
  const balance = Number(debt.balance);
  const rate = debt.interestRate !== null ? Number(debt.interestRate) : 0;
  const payment = debt.monthlyPayment !== null ? Number(debt.monthlyPayment) : 0;

  const projection = projectPayoff(balance, rate, payment, now);

  let extraPaymentSaving: DebtProjection["extraPaymentSaving"];
  if (projection && !projection.neverPaysOff) {
    const extra = Math.max(Math.round(payment * 0.1), 1);
    const faster = projectPayoff(balance, rate, payment + extra, now);
    if (faster && !faster.neverPaysOff) {
      extraPaymentSaving = {
        extra,
        monthsSaved: projection.months - faster.months,
        interestSaved: projection.totalInterest - faster.totalInterest,
      };
    }
  }

  return { debt, balance, rate, payment, projection, extraPaymentSaving };
}

export type Strategy = "avalanche" | "snowball";

export const STRATEGY_LABEL: Record<Strategy, string> = {
  avalanche: "Avalanche (highest rate first)",
  snowball: "Snowball (smallest balance first)",
};

export type StrategyResult = {
  /** Payoff order under this strategy. */
  order: { name: string; clearedInMonths: number }[];
  months: number;
  totalInterest: number;
};

/**
 * Runs the whole debt set to zero under one strategy.
 *
 * Both strategies pay every debt's recorded monthly payment, then throw
 * everything spare at a single target; when a debt clears, its payment rolls
 * into the next target. Avalanche targets the highest rate (cheapest overall),
 * snowball the smallest balance (fastest first win).
 *
 * `extraMonthly` matters more than it looks. With nothing spare, every debt is
 * simply paying its own recorded amount, so the first debt to clear is the
 * same under both strategies and the two plans come out identical or nearly
 * so — the choice only starts to bite once there's money to direct. The UI
 * says as much rather than presenting two identical numbers as a comparison.
 */
export function simulateStrategy(
  debts: Debt[],
  strategy: Strategy,
  extraMonthly = 0,
): StrategyResult | undefined {
  const rows = debts
    .map((d) => ({
      name: d.name,
      balance: Number(d.balance),
      rate: d.interestRate !== null ? Number(d.interestRate) / 100 / 12 : 0,
      payment: d.monthlyPayment !== null ? Number(d.monthlyPayment) : 0,
    }))
    .filter((r) => r.balance > 0);

  if (rows.length === 0) return undefined;

  const budget = rows.reduce((sum, r) => sum + r.payment, 0) + Math.max(extraMonthly, 0);
  if (budget <= 0) return undefined;

  const order: StrategyResult["order"] = [];
  let totalInterest = 0;
  let months = 0;

  while (rows.some((r) => r.balance > 0) && months < MAX_MONTHS) {
    for (const row of rows) {
      if (row.balance <= 0) continue;
      const interest = row.balance * row.rate;
      row.balance += interest;
      totalInterest += interest;
    }

    // Minimums first, so no debt falls behind while another is targeted.
    let spare = budget;
    for (const row of rows) {
      if (row.balance <= 0) continue;
      const pay = Math.min(row.payment, row.balance);
      row.balance -= pay;
      spare -= pay;
    }

    // Spare rolls onto one target: the highest rate, or the smallest balance.
    // Keep going while money is left, so a target that clears mid-month hands
    // the remainder straight to the next one.
    let live = rows.filter((r) => r.balance > 0);
    while (spare > 0 && live.length > 0) {
      const target =
        strategy === "avalanche"
          ? live.reduce((best, r) => (r.rate > best.rate ? r : best), live[0])
          : live.reduce((best, r) => (r.balance < best.balance ? r : best), live[0]);
      const pay = Math.min(spare, target.balance);
      target.balance -= pay;
      spare -= pay;
      live = live.filter((r) => r.balance > 0);
    }

    months++;

    for (const row of rows) {
      if (row.balance <= 0 && !order.some((o) => o.name === row.name)) {
        order.push({ name: row.name, clearedInMonths: months });
      }
    }

    if (rows.every((r) => r.balance <= 0)) break;
  }

  if (rows.some((r) => r.balance > 0)) return undefined;

  return { order, months, totalInterest };
}

/** "3y 4m" — months alone stop being readable past a year or two. */
export function formatMonths(months: number): string {
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years}y` : `${years}y ${rest}m`;
}
