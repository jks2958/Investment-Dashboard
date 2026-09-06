/**
 * "Today" in the user's timezone, not the server's.
 *
 * Vercel functions run in UTC. A user at UTC+5 recording a snapshot at 1am
 * their time would have it filed under the previous day, and the backfill
 * editor — which uses the browser's local date — would then disagree with the
 * server about which row is today's.
 *
 * SNAPSHOT_UTC_OFFSET_MINUTES is the user's offset from UTC in minutes
 * (Pakistan, UTC+5, is 300). Unset means UTC, which is the old behaviour.
 */
export function localTodayIso(now = new Date()): string {
  const offsetMinutes = Number(process.env.SNAPSHOT_UTC_OFFSET_MINUTES ?? 0);
  const shifted = new Date(
    now.getTime() + (Number.isFinite(offsetMinutes) ? offsetMinutes : 0) * 60_000,
  );
  return shifted.toISOString().slice(0, 10);
}
