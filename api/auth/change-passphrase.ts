import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

import { requireAuth } from "../../lib/server/requireAuth.js";
import { changePassphrase, verifyPassphrase } from "../../lib/server/session.js";

const bodySchema = z.object({
  currentPassphrase: z.string().min(1),
  newPassphrase: z.string().min(4),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  if (!(await verifyPassphrase(parsed.data.currentPassphrase))) {
    res.status(401).json({ error: "Current passphrase is incorrect" });
    return;
  }

  await changePassphrase(parsed.data.newPassphrase);
  res.status(200).json({ ok: true });
}
