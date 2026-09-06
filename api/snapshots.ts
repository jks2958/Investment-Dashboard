import type { VercelRequest, VercelResponse } from "@vercel/node";

import { isCronRequest } from "../lib/server/cron.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import {
  deleteSnapshot,
  getRecentSnapshots,
  listAllSnapshots,
  recordTodaySnapshot,
  upsertSnapshots,
} from "../lib/server/snapshots.js";
import { snapshotBulkSchema } from "../lib/server/validation.js";

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // The nightly cron has no session cookie. Without it, history only gains a
  // row on days the app is opened, and the trend chart draws a straight line
  // across the gap — a smooth trend that never happened.
  if (req.method === "GET" && isCronRequest(req)) {
    await recordTodaySnapshot();
    res.status(200).json({ ok: true, recorded: true });
    return;
  }

  if (!(await requireAuth(req, res))) return;

  if (req.method === "GET") {
    // ?all=1 returns the full history for the editor; otherwise a range that
    // also records today, which is what the charts read.
    if (one(req.query.all) === "1") {
      res.status(200).json(await listAllSnapshots());
      return;
    }

    const rawDays = req.query.days;
    const daysParam = Number(one(rawDays));
    const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 730) : 30;

    await recordTodaySnapshot();
    res.status(200).json(await getRecentSnapshots(days));
    return;
  }

  // Backfill. Always an array, so one entry and a bulk paste share a path.
  if (req.method === "POST") {
    const parsed = snapshotBulkSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    await upsertSnapshots(parsed.data);
    res.status(200).json({ ok: true, count: parsed.data.length });
    return;
  }

  if (req.method === "DELETE") {
    const date = one(req.query.date);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "Expected a YYYY-MM-DD date" });
      return;
    }

    if (!(await deleteSnapshot(date))) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
