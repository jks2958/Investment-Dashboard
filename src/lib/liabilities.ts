import type {
  Commitment,
  CommitmentCategory,
  CommitmentCertainty,
  Debt,
  DebtKind,
} from "@/lib/api";

export const DEBT_KIND_LABEL: Record<DebtKind, string> = {
  mortgage: "Mortgage",
  car: "Car loan",
  credit_card: "Credit card",
  student: "Student loan",
  personal: "Personal loan",
  business: "Business loan",
  other: "Other",
};

export const DEBT_KINDS = Object.keys(DEBT_KIND_LABEL) as DebtKind[];

export const COMMITMENT_CATEGORY_LABEL: Record<CommitmentCategory, string> = {
  education: "Education",
  family: "Family",
  purchase: "Major purchase",
  medical: "Medical",
  travel: "Travel",
  other: "Other",
};

export const COMMITMENT_CATEGORIES = Object.keys(
  COMMITMENT_CATEGORY_LABEL,
) as CommitmentCategory[];

export const CERTAINTY_LABEL: Record<CommitmentCertainty, string> = {
  confirmed: "Confirmed",
  likely: "Likely",
  possible: "Possible",
};

export const CERTAINTIES = Object.keys(CERTAINTY_LABEL) as CommitmentCertainty[];

export type DebtSummary = {
  totalOwed: number;
  monthlyPayments: number;
  /** Highest interest rate carried, for "pay this one first". */
  highestRate?: { name: string; rate: number };
};

export function summarizeDebts(debts: Debt[]): DebtSummary {
  const totalOwed = debts.reduce((sum, d) => sum + Number(d.balance), 0);
  const monthlyPayments = debts.reduce(
    (sum, d) => sum + (d.monthlyPayment !== null ? Number(d.monthlyPayment) : 0),
    0,
  );

  let highestRate: DebtSummary["highestRate"];
  for (const debt of debts) {
    if (debt.interestRate === null) continue;
    const rate = Number(debt.interestRate);
    if (!highestRate || rate > highestRate.rate) highestRate = { name: debt.name, rate };
  }

  return { totalOwed, monthlyPayments, highestRate };
}

export type CommitmentMath = {
  /** amount x recurringYears — the whole obligation, not one instalment. */
  totalAmount: number;
  funded: number;
  remaining: number;
  monthsUntilDue: number;
  /** What to set aside each month from now to be ready in time. */
  requiredMonthly: number;
  isOverdue: boolean;
};

function monthsBetween(from: Date, toIso: string): number {
  const [y, m, d] = toIso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return 0;
  const to = new Date(y, m - 1, d);
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months--;
  return months;
}

export function commitmentMath(commitment: Commitment, now = new Date()): CommitmentMath {
  const totalAmount = Number(commitment.amount) * commitment.recurringYears;
  const funded = Number(commitment.fundedAmount);
  const remaining = Math.max(totalAmount - funded, 0);
  const monthsUntilDue = monthsBetween(now, commitment.dueOn);

  return {
    totalAmount,
    funded,
    remaining,
    monthsUntilDue,
    // Past due (or due this month) means the whole remainder is needed now.
    requiredMonthly: monthsUntilDue > 0 ? remaining / monthsUntilDue : remaining,
    isOverdue: monthsUntilDue < 0,
  };
}

/** Certainty weights nothing in the maths — it only filters what's counted. */
export function totalRequiredMonthly(
  items: Commitment[],
  include: CommitmentCertainty[] = ["confirmed", "likely", "possible"],
): number {
  return items
    .filter((c) => include.includes(c.certainty))
    .reduce((sum, c) => sum + commitmentMath(c).requiredMonthly, 0);
}
