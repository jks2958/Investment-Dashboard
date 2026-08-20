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
