import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";

import { db } from "../db/client";
import { dashboardSettings } from "../db/schema";
import {
  DEFAULT_ACCENT,
  DEFAULT_LAYOUT_LG,
  DEFAULT_LAYOUT_MD,
} from "../lib/server/dashboardDefaults";
import { requireAuth } from "../lib/server/requireAuth";
import { dashboardSettingsUpdateSchema } from "../lib/server/validation";

const SETTINGS_ID = 1;

async function getOrCreateSettings() {
  const [row] = await db.select().from(dashboardSettings).limit(1);
  if (row) return row;

  const [created] = await db
    .insert(dashboardSettings)
    .values({
      id: SETTINGS_ID,
      layoutLg: DEFAULT_LAYOUT_LG,
      layoutMd: DEFAULT_LAYOUT_MD,
      accent: DEFAULT_ACCENT,
    })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  const [existing] = await db.select().from(dashboardSettings).limit(1);
  return existing;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    const settings = await getOrCreateSettings();
    res.status(200).json(settings);
    return;
  }

  if (req.method === "PATCH") {
    const parsed = dashboardSettingsUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    await getOrCreateSettings();

    const { reset, layoutLg, layoutMd, accent } = parsed.data;
    const updates = reset
      ? { layoutLg: DEFAULT_LAYOUT_LG, layoutMd: DEFAULT_LAYOUT_MD }
      : {
          ...(layoutLg !== undefined ? { layoutLg } : {}),
          ...(layoutMd !== undefined ? { layoutMd } : {}),
          ...(accent !== undefined ? { accent } : {}),
        };

    const [updated] = await db
      .update(dashboardSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dashboardSettings.id, SETTINGS_ID))
      .returning();

    res.status(200).json(updated);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
