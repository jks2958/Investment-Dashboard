export function isInMonthOffset(dateIso: string, offsetMonths: number): boolean {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  const target = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return dateIso.slice(0, 7) === target;
}

export function currentMonthLabel(offsetMonths = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Today as YYYY-MM-DD in local time — toISOString() would use UTC and roll
 *  the date over early or late depending on the timezone offset. */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function parseIso(iso: string): Date | undefined {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export function formatDateShort(iso: string): string {
  const date = parseIso(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Rough human span since a date, e.g. "2y 3m", "5 mo", "12 days". */
export function elapsedSince(iso: string): string | undefined {
  const start = parseIso(iso);
  if (!start) return undefined;

  const now = new Date();
  if (start > now) return undefined;

  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months--;

  if (months < 1) {
    const days = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
    if (days < 1) return "today";
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  if (months < 12) return `${months} mo`;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return remainder === 0 ? `${years}y` : `${years}y ${remainder}m`;
}
