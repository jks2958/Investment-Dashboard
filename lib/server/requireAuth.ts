import type { VercelRequest, VercelResponse } from "@vercel/node";

import { isSessionValid } from "./session.js";

export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!isSessionValid(req.headers.cookie)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
