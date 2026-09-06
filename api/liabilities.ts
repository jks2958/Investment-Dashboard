import type { VercelRequest, VercelResponse } from "@vercel/node";
import { asc, eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { commitments, debts } from "../db/schema.js";
import { currentUsdPkrRate, withUsd } from "../lib/server/money.js";
import { requireAuth } from "../lib/server/requireAuth.js";
import {
  commitmentInsertSchema,
  commitmentUpdateSchema,
  debtInsertSchema,
  debtUpdateSchema,
} from "../lib/server/validation.js";

// Debts and commitments share one function rather than taking a file each:
// Vercel's Hobby plan caps a deployment at 12 Serverless Functions and this
// project is close to it. vercel.json rewrites /api/debts and /api/commitments
// (with or without an :id) here, passing the resource in as ?kind=.

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function handleDebts(req: VercelRequest, res: VercelResponse, idParam?: string) {
  if (idParam === undefined) {
    if (req.method === "GET") {
      const rate = await currentUsdPkrRate();
      const rows = await db.select().from(debts).orderBy(asc(debts.name));
      res.status(200).json(rows.map((row) => withUsd(row, ["balance", "originalAmount", "monthlyPayment"], rate)));
      return;
    }

    if (req.method === "POST") {
      const parsed = debtInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
        return;
      }

      const { balance, originalAmount, interestRate, monthlyPayment, ...rest } = parsed.data;
      const [created] = await db
        .insert(debts)
        .values({
          ...rest,
          balance: String(balance),
          ...(originalAmount !== undefined ? { originalAmount: String(originalAmount) } : {}),
          ...(interestRate !== undefined ? { interestRate: String(interestRate) } : {}),
          ...(monthlyPayment !== undefined ? { monthlyPayment: String(monthlyPayment) } : {}),
        })
        .returning();

      res.status(201).json(withUsd(created, ["balance", "originalAmount", "monthlyPayment"], await currentUsdPkrRate()));
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  if (req.method === "PATCH") {
    const parsed = debtUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    const { balance, originalAmount, interestRate, monthlyPayment, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    if (balance !== undefined) updates.balance = String(balance);
    if (originalAmount !== undefined) updates.originalAmount = String(originalAmount);
    if (interestRate !== undefined) updates.interestRate = String(interestRate);
    if (monthlyPayment !== undefined) updates.monthlyPayment = String(monthlyPayment);

    const [updated] = await db.update(debts).set(updates).where(eq(debts.id, id)).returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(200).json(withUsd(updated, ["balance", "originalAmount", "monthlyPayment"], await currentUsdPkrRate()));
    return;
  }

  if (req.method === "DELETE") {
    const [deleted] = await db.delete(debts).where(eq(debts.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}

async function handleCommitments(req: VercelRequest, res: VercelResponse, idParam?: string) {
  if (idParam === undefined) {
    if (req.method === "GET") {
      const rate = await currentUsdPkrRate();
      const rows = await db.select().from(commitments).orderBy(asc(commitments.dueOn));
      res.status(200).json(rows.map((row) => withUsd(row, ["amount", "fundedAmount"], rate)));
      return;
    }

    if (req.method === "POST") {
      const parsed = commitmentInsertSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
        return;
      }

      const { amount, fundedAmount, ...rest } = parsed.data;
      const [created] = await db
        .insert(commitments)
        .values({
          ...rest,
          amount: String(amount),
          ...(fundedAmount !== undefined ? { fundedAmount: String(fundedAmount) } : {}),
        })
        .returning();

      res.status(201).json(withUsd(created, ["amount", "fundedAmount"], await currentUsdPkrRate()));
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  if (req.method === "PATCH") {
    const parsed = commitmentUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }

    const { amount, fundedAmount, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    if (amount !== undefined) updates.amount = String(amount);
    if (fundedAmount !== undefined) updates.fundedAmount = String(fundedAmount);

    const [updated] = await db
      .update(commitments)
      .set(updates)
      .where(eq(commitments.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(200).json(withUsd(updated, ["amount", "fundedAmount"], await currentUsdPkrRate()));
    return;
  }

  if (req.method === "DELETE") {
    const [deleted] = await db.delete(commitments).where(eq(commitments.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;

  const kind = one(req.query.kind);
  const idParam = one(req.query.id);

  if (kind === "debt") {
    await handleDebts(req, res, idParam);
    return;
  }

  if (kind === "commitment") {
    await handleCommitments(req, res, idParam);
    return;
  }

  res.status(404).json({ error: "Not found" });
}
