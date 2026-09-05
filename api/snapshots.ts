import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../lib/server/requireAuth.js";
import { getRecentSnapshots, recordTodaySnapshot } from "../lib/server/snapshots.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawDays = req.query.days;
  const daysParam = Number(Array.isArray(rawDays) ? rawDays[0] : rawDays);
  const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 730) : 30;

  await recordTodaySnapshot();
  const snapshots = await getRecentSnapshots(days);
  res.status(200).json(snapshots);
}
