import type { VercelRequest, VercelResponse } from "@vercel/node";

import { clearSessionCookie, isHttpsRequest } from "../../lib/server/session";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader("Set-Cookie", clearSessionCookie(isHttpsRequest(req)));
  res.status(200).json({ ok: true });
}
