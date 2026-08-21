import type { VercelRequest, VercelResponse } from "@vercel/node";

import { isSessionValid } from "../../lib/server/session.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ authenticated: isSessionValid(req.headers.cookie) });
}
