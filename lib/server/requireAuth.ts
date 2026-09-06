import type { VercelRequest, VercelResponse } from "@vercel/node";

import { isSessionValid } from "./session.js";

/**
 * Async because validity now depends on the stored session epoch, not just the
 * cookie's own signature — that's what makes "sign out everywhere" real rather
 * than advisory. Costs one indexed single-row read per request, on a database
 * every one of these handlers was already going to hit.
 */
export async function requireAuth(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  if (!(await isSessionValid(req.headers.cookie))) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
