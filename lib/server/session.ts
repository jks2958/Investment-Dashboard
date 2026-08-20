import { createHmac, timingSafeEqual } from "node:crypto";

import { db } from "../../db/client";
import { authConfig } from "../../db/schema";

const COOKIE_NAME = "session";
const AUTH_CONFIG_ID = 1;
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) throw new Error("AUTH_SESSION_SECRET is not set");
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionCookie(): string {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(exp);
  const signature = sign(payload);
  const token = `${payload}.${signature}`;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export function isSessionValid(cookieHeader: string | undefined): boolean {
  const token = parseCookies(cookieHeader)[COOKIE_NAME];
  if (!token) return false;

  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;

  return true;
}

function hashPassphrase(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

async function getPassphraseHash(): Promise<string> {
  const [row] = await db
    .select({ passphraseHash: authConfig.passphraseHash })
    .from(authConfig)
    .limit(1);

  if (row) return row.passphraseHash;

  const seed = process.env.AUTH_PASSPHRASE;
  if (!seed) throw new Error("AUTH_PASSPHRASE is not set");

  const hash = hashPassphrase(seed);
  await db
    .insert(authConfig)
    .values({ id: AUTH_CONFIG_ID, passphraseHash: hash })
    .onConflictDoNothing();
  return hash;
}

export async function verifyPassphrase(candidate: string): Promise<boolean> {
  const expected = await getPassphraseHash();
  const a = Buffer.from(hashPassphrase(candidate));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function changePassphrase(next: string): Promise<void> {
  const hash = hashPassphrase(next);
  await db
    .insert(authConfig)
    .values({ id: AUTH_CONFIG_ID, passphraseHash: hash, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: authConfig.id,
      set: { passphraseHash: hash, updatedAt: new Date() },
    });
}
