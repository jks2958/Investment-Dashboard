import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

import { requireAuth } from "../lib/server/requireAuth.js";
import {
  changePassphrase,
  clearFailedLogins,
  clearSessionCookie,
  createSessionCookie,
  getLockState,
  isHttpsRequest,
  isSessionValid,
  recordFailedLogin,
  revokeAllSessions,
  verifyPassphrase,
} from "../lib/server/session.js";

const loginBodySchema = z.object({ passphrase: z.string().min(1) });
const changePassphraseBodySchema = z.object({
  currentPassphrase: z.string().min(1),
  newPassphrase: z.string().min(4),
});

function lockMessage(seconds: number): string {
  if (seconds < 60) return `Too many attempts. Try again in ${seconds}s.`;
  return `Too many attempts. Try again in ${Math.ceil(seconds / 60)} min.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawAction = req.query.action;
  const action = Array.isArray(rawAction) ? rawAction[0] : rawAction;

  if (action === "session") {
    res.status(200).json({ authenticated: await isSessionValid(req.headers.cookie) });
    return;
  }

  if (action === "login") {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Checked before the passphrase is even read: while locked out there is
    // nothing to learn from the response, correct guess or not.
    const lock = await getLockState();
    if (lock.locked) {
      res.setHeader("Retry-After", String(lock.retryAfterSeconds));
      res.status(429).json({ error: lockMessage(lock.retryAfterSeconds) });
      return;
    }

    const parsed = loginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Passphrase required" });
      return;
    }

    if (!(await verifyPassphrase(parsed.data.passphrase))) {
      const next = await recordFailedLogin();
      if (next.locked) {
        res.setHeader("Retry-After", String(next.retryAfterSeconds));
        res.status(429).json({ error: lockMessage(next.retryAfterSeconds) });
        return;
      }
      res.status(401).json({ error: "Incorrect passphrase" });
      return;
    }

    await clearFailedLogins();
    res.setHeader("Set-Cookie", await createSessionCookie(isHttpsRequest(req)));
    res.status(200).json({ ok: true });
    return;
  }

  if (action === "logout") {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    res.setHeader("Set-Cookie", clearSessionCookie(isHttpsRequest(req)));
    res.status(200).json({ ok: true });
    return;
  }

  if (action === "revoke-sessions") {
    if (!(await requireAuth(req, res))) return;

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Deliberately signs this device out too — "everywhere" has to mean
    // everywhere, or a stolen device could still be the one left signed in.
    await revokeAllSessions();
    res.setHeader("Set-Cookie", clearSessionCookie(isHttpsRequest(req)));
    res.status(200).json({ ok: true });
    return;
  }

  if (action === "change-passphrase") {
    if (!(await requireAuth(req, res))) return;

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const parsed = changePassphraseBodySchema.safeParse(req.body);
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
    return;
  }

  res.status(404).json({ error: "Not found" });
}
