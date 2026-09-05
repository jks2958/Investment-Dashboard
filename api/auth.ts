import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

import { requireAuth } from "../lib/server/requireAuth.js";
import {
  changePassphrase,
  clearSessionCookie,
  createSessionCookie,
  isHttpsRequest,
  isSessionValid,
  verifyPassphrase,
} from "../lib/server/session.js";

const loginBodySchema = z.object({ passphrase: z.string().min(1) });
const changePassphraseBodySchema = z.object({
  currentPassphrase: z.string().min(1),
  newPassphrase: z.string().min(4),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawAction = req.query.action;
  const action = Array.isArray(rawAction) ? rawAction[0] : rawAction;

  if (action === "session") {
    res.status(200).json({ authenticated: isSessionValid(req.headers.cookie) });
    return;
  }

  if (action === "login") {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const parsed = loginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Passphrase required" });
      return;
    }

    if (!(await verifyPassphrase(parsed.data.passphrase))) {
      res.status(401).json({ error: "Incorrect passphrase" });
      return;
    }

    res.setHeader("Set-Cookie", createSessionCookie(isHttpsRequest(req)));
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

  if (action === "change-passphrase") {
    if (!requireAuth(req, res)) return;

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
