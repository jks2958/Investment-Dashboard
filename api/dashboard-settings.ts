import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { dashboardSettings } from "../db/schema.js";
import {
  DEFAULT_ACCENT,
  DEFAULT_CARD_SKIN,
  DEFAULT_CURRENCY,
  DEFAULT_LAYOUT_LG,
  DEFAULT_LAYOUT_MD,
  DEFAULT_TARGETS,
  DEFAULT_USD_PKR_RATE,
} from "../lib/server/dashboardDefaults.js";
import { fetchUsdPkrRate } from "../lib/server/fx.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import { dashboardSettingsUpdateSchema } from "../lib/server/validation.js";

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
      cardSkin: DEFAULT_CARD_SKIN,
      targets: DEFAULT_TARGETS,
      currency: DEFAULT_CURRENCY,
      usdPkrRate: String(DEFAULT_USD_PKR_RATE),
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

    const { reset, layoutLg, layoutMd, accent, cardSkin, targets, currency, usdPkrRate, refreshRate } =
      parsed.data;

    // A failed lookup leaves the stored rate alone rather than erroring — it
    // stays editable by hand, so a flaky FX API can't block the setting.
    const fetchedRate = refreshRate ? await fetchUsdPkrRate() : undefined;

    // Reset restores the default widget layout only — accent, card skin,
    // targets and currency are user preferences, not layout.
    const updates = reset
      ? { layoutLg: DEFAULT_LAYOUT_LG, layoutMd: DEFAULT_LAYOUT_MD }
      : {
          ...(layoutLg !== undefined ? { layoutLg } : {}),
          ...(layoutMd !== undefined ? { layoutMd } : {}),
          ...(accent !== undefined ? { accent } : {}),
          ...(cardSkin !== undefined ? { cardSkin } : {}),
          ...(targets !== undefined ? { targets } : {}),
          ...(currency !== undefined ? { currency } : {}),
          ...(usdPkrRate !== undefined ? { usdPkrRate: String(usdPkrRate) } : {}),
          ...(fetchedRate !== undefined ? { usdPkrRate: String(fetchedRate) } : {}),
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
