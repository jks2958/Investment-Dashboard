import type { VercelRequest } from "@vercel/node";

/**
 * Whether this request is Vercel's scheduler rather than a browser.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on cron invocations when
 * that env var is set. Without the secret configured we refuse rather than
 * defaulting to open: the endpoint writes to the database, and an unauthenticated
 * public write is worse than a cron that doesn't run.
 */
export function isCronRequest(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.authorization;
  return header === `Bearer ${secret}`;
}
