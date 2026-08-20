import type { VercelRequest, VercelResponse } from "@vercel/node";

import { db } from "../db/client";
import { profile } from "../db/schema";
import { requireAuth } from "../lib/server/requireAuth";
import { profileUpdateSchema } from "../lib/server/validation";

const PROFILE_ID = 1;
const DEFAULT_NAME = "Investor";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    const [row] = await db.select().from(profile).limit(1);
    res.status(200).json({ name: row?.name ?? DEFAULT_NAME });
    return;
  }

  if (req.method === "PATCH") {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    await db
      .insert(profile)
      .values({ id: PROFILE_ID, name: parsed.data.name })
      .onConflictDoUpdate({
        target: profile.id,
        set: { name: parsed.data.name, updatedAt: new Date() },
      });

    res.status(200).json({ name: parsed.data.name });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
