import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

import { createSessionCookie, verifyPassphrase } from "../../lib/server/session";

const bodySchema = z.object({ passphrase: z.string().min(1) });

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Passphrase required" });
    return;
  }

  if (!verifyPassphrase(parsed.data.passphrase)) {
    res.status(401).json({ error: "Incorrect passphrase" });
    return;
  }

  res.setHeader("Set-Cookie", createSessionCookie());
  res.status(200).json({ ok: true });
}
