import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "../../db/client.js";
import { authConfig } from "../../db/schema.js";

/** promisify() loses the options overload, and the cost parameter is the whole
 *  point of using scrypt, so this wraps the callback form directly. */
function scryptAsync(value: string, salt: string, keylen: number, cost: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(value, salt, keylen, { N: cost, maxmem: SCRYPT_MAXMEM }, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

const COOKIE_NAME = "session";
const AUTH_CONFIG_ID = 1;

/**
 * Seven days, not thirty.
 *
 * This is a finance dashboard reached from a tablet that leaves the house. A
 * month-long cookie meant a lost device stayed signed in for a month, and
 * until now there was no way to end that session early from anywhere else.
 */
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * scrypt work factor, and the memory ceiling it needs.
 *
 * N=32768 costs 128 * N * r = exactly 32MB with the default r=8, which is
 * Node's default `maxmem` — and the check is `>= `, so it throws
 * ERR_CRYPTO_INVALID_SCRYPT_PARAMS rather than running slowly. Raising maxmem
 * alongside N is not optional; leaving it at the default would fail every
 * login attempt, including the one that would let you fix it.
 *
 * Measured ~100ms per hash on this runtime: slow enough to make offline
 * guessing painful, fast enough to be invisible at the login screen.
 */
const SCRYPT_COST = 32768;
const SCRYPT_MAXMEM = 64 * 1024 * 1024;
const SCRYPT_KEYLEN = 64;

export function isHttpsRequest(req: {
  headers: { [key: string]: string | string[] | undefined };
}): boolean {
  return req.headers["x-forwarded-proto"] === "https";
}

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) throw new Error("AUTH_SESSION_SECRET is not set");
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function equal(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

// ---------------------------------------------------------------- auth row

type AuthRow = typeof authConfig.$inferSelect;

async function getAuthRow(): Promise<AuthRow> {
  const [row] = await db.select().from(authConfig).where(eq(authConfig.id, AUTH_CONFIG_ID));
  if (row) return row;

  const seed = process.env.AUTH_PASSPHRASE;
  if (!seed) throw new Error("AUTH_PASSPHRASE is not set");

  const { hash, salt } = await hashPassphrase(seed);
  const [created] = await db
    .insert(authConfig)
    .values({ id: AUTH_CONFIG_ID, passphraseHash: hash, passphraseSalt: salt })
    .onConflictDoNothing()
    .returning();

  if (created) return created;
  // Another request seeded it between our read and write.
  const [existing] = await db.select().from(authConfig).where(eq(authConfig.id, AUTH_CONFIG_ID));
  return existing;
}

// ---------------------------------------------------------------- cookies

export async function createSessionCookie(secure: boolean): Promise<string> {
  const row = await getAuthRow();
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  // The epoch travels in the signed payload, so revoking is one increment
  // rather than a table of live tokens to keep and expire.
  const payload = `${exp}.${row.sessionEpoch}`;
  const token = `${payload}.${sign(payload)}`;
  const secureAttr = secure ? " Secure;" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly;${secureAttr} SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookie(secure: boolean): string {
  const secureAttr = secure ? " Secure;" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly;${secureAttr} SameSite=Lax; Max-Age=0`;
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

/**
 * Checks signature and expiry without touching the database.
 *
 * Split from the epoch check so the cheap, offline half runs first: a forged
 * or expired cookie is rejected before we spend a query on it.
 */
function verifySignedCookie(
  cookieHeader: string | undefined,
): { epoch: number } | undefined {
  const token = parseCookies(cookieHeader)[COOKIE_NAME];
  if (!token) return undefined;

  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return undefined;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!equal(signature, sign(payload))) return undefined;

  const [expPart, epochPart] = payload.split(".");
  const exp = Number(expPart);
  if (!Number.isFinite(exp) || exp < Date.now()) return undefined;

  // Cookies issued before the epoch existed carry no epoch. Treating them as
  // epoch 1 lets sessions from the previous scheme survive the upgrade; the
  // first "sign out everywhere" retires them.
  const epoch = epochPart === undefined ? 1 : Number(epochPart);
  if (!Number.isFinite(epoch)) return undefined;

  return { epoch };
}

export async function isSessionValid(cookieHeader: string | undefined): Promise<boolean> {
  const parsed = verifySignedCookie(cookieHeader);
  if (!parsed) return false;

  const row = await getAuthRow();
  return parsed.epoch === row.sessionEpoch;
}

/** Invalidates every session cookie, including the one making the request. */
export async function revokeAllSessions(): Promise<void> {
  const row = await getAuthRow();
  await db
    .update(authConfig)
    .set({ sessionEpoch: row.sessionEpoch + 1, updatedAt: new Date() })
    .where(eq(authConfig.id, AUTH_CONFIG_ID));
}

// ------------------------------------------------------------- passphrase

async function hashPassphrase(value: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const useSalt = salt ?? randomBytes(16).toString("base64url");
  const derived = await scryptAsync(value, useSalt, SCRYPT_KEYLEN, SCRYPT_COST);
  return { hash: derived.toString("base64url"), salt: useSalt };
}

/** The original scheme: an unsalted HMAC. Kept only to verify passphrases
 *  stored before the upgrade, so nobody is locked out by it. */
function legacyHash(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export async function verifyPassphrase(candidate: string): Promise<boolean> {
  const row = await getAuthRow();

  if (row.passphraseSalt === null) {
    if (!equal(legacyHash(candidate), row.passphraseHash)) return false;
    // Correct passphrase on an old-format row: silently re-store it under
    // scrypt, so the upgrade needs no action from the user.
    await changePassphrase(candidate);
    return true;
  }

  const { hash } = await hashPassphrase(candidate, row.passphraseSalt);
  return equal(hash, row.passphraseHash);
}

export async function changePassphrase(next: string): Promise<void> {
  const { hash, salt } = await hashPassphrase(next);
  await db
    .insert(authConfig)
    .values({
      id: AUTH_CONFIG_ID,
      passphraseHash: hash,
      passphraseSalt: salt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: authConfig.id,
      set: { passphraseHash: hash, passphraseSalt: salt, updatedAt: new Date() },
    });
}

// ----------------------------------------------------------- rate limiting

/** Free attempts before the delays start. Enough for ordinary fat-fingering. */
const FREE_ATTEMPTS = 5;
/** Lockout after the free ones, doubling each time, capped. */
const BASE_LOCK_SECONDS = 30;
const MAX_LOCK_SECONDS = 15 * 60;

export type LockState = { locked: true; retryAfterSeconds: number } | { locked: false };

export async function getLockState(): Promise<LockState> {
  const row = await getAuthRow();
  if (!row.lockedUntil) return { locked: false };

  const remaining = row.lockedUntil.getTime() - Date.now();
  if (remaining <= 0) return { locked: false };
  return { locked: true, retryAfterSeconds: Math.ceil(remaining / 1000) };
}

/**
 * Records a failed login and returns how long the door is now shut.
 *
 * Doubling from 30s means a guesser gets roughly 5 free tries and then a
 * handful an hour, which is fatal to online brute force while barely
 * inconveniencing someone who mistyped. Nothing here helps against an
 * attacker who already has the database — that's what scrypt is for.
 */
export async function recordFailedLogin(): Promise<LockState> {
  const row = await getAuthRow();
  const attempts = row.failedAttempts + 1;

  let lockedUntil: Date | null = null;
  if (attempts > FREE_ATTEMPTS) {
    const seconds = Math.min(
      BASE_LOCK_SECONDS * 2 ** (attempts - FREE_ATTEMPTS - 1),
      MAX_LOCK_SECONDS,
    );
    lockedUntil = new Date(Date.now() + seconds * 1000);
  }

  await db
    .update(authConfig)
    .set({ failedAttempts: attempts, lockedUntil })
    .where(eq(authConfig.id, AUTH_CONFIG_ID));

  return lockedUntil
    ? { locked: true, retryAfterSeconds: Math.ceil((lockedUntil.getTime() - Date.now()) / 1000) }
    : { locked: false };
}

export async function clearFailedLogins(): Promise<void> {
  await db
    .update(authConfig)
    .set({ failedAttempts: 0, lockedUntil: null })
    .where(eq(authConfig.id, AUTH_CONFIG_ID));
}
