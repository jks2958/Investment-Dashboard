/**
 * Getting your data back out.
 *
 * Every financial record lives in one free-tier Postgres database with no
 * export path — if that project lapses or is deleted, it's gone. This builds
 * the archive in the browser from data the app has already fetched, which
 * matters for a reason beyond convenience: on Vercel's Hobby plan the project
 * is one function short of the 12-function cap, and an export endpoint would
 * have spent the last slot.
 */

export type ExportTable = {
  name: string;
  rows: Record<string, unknown>[];
};

/** RFC 4180: quote when the value contains a comma, quote or newline, and
 *  double any quote inside. Excel and Numbers both rely on this. */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  // Union of keys, not just the first row's: an optional column absent from
  // row one would otherwise silently drop for every row.
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((col) => csvCell(row[col])).join(","));
  }
  return lines.join("\n");
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function download(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in some browsers; a tick is
  // enough for the navigation to have started.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** One JSON file holding every table — the format to re-import from. */
export function downloadJson(tables: ExportTable[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    tables: Object.fromEntries(tables.map((t) => [t.name, t.rows])),
  };
  download(`portfolio-dashboard-${today()}.json`, JSON.stringify(payload, null, 2), "application/json");
}

/**
 * One CSV per table, downloaded in sequence.
 *
 * Not a zip: bundling one would mean pulling in a compression library for a
 * handful of small text files. Browsers do prompt per file on the first of a
 * burst, which the UI warns about.
 */
export function downloadCsvs(tables: ExportTable[]) {
  const stamp = today();
  for (const table of tables) {
    if (table.rows.length === 0) continue;
    download(`${table.name}-${stamp}.csv`, toCsv(table.rows), "text/csv");
  }
}

export function countRows(tables: ExportTable[]): number {
  return tables.reduce((sum, t) => sum + t.rows.length, 0);
}
