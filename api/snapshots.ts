import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../lib/server/requireAuth.js";
import { getRecentSnapshots, recordTodaySnapshot } from "../lib/server/snapshots.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  await recordTodaySnapshot();
  const snapshots = await getRecentSnapshots(30);
  res.status(200).json(snapshots);
}
