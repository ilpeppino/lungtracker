import { Router } from "express";
import { config } from "../config.js";
import { requireSupabaseUser } from "../auth/supabase.js";
import { supabaseAdmin } from "../db/supabaseAdmin.js";
import { sha256Hex } from "../util/crypto.js";

export const reportsRouter = Router();

/**
 * GET /reports/exports?limit=30
 * Auth: Supabase access token
 * Returns export history (sanitized)
 */
reportsRouter.get("/exports", async (req, res) => {
  try {
    const { userId } = await requireSupabaseUser(req.headers.authorization);

    const limitRaw = Number(req.query.limit ?? 20);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20;

    const q = await supabaseAdmin
      .from("report_exports")
      .select("id, range_start, range_end, recipient_email, sent_at, downloaded_at, expires_at, status")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .limit(limit);

    if (q.error) throw q.error;

    return res.json(q.data ?? []);
  } catch (e: any) {
    return res.status(401).json({ error: e?.message ?? "Unauthorized" });
  }
});

/**
 * GET /reports/r/:token
 * Public endpoint (recipient)
 * For now: validates token existence + expiry and returns a JSON stub.
 * Next step: create a short-lived Supabase signed URL and redirect to it.
 */
reportsRouter.get("/r/:token", async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) return res.status(400).send("Missing token");

    const tokenHash = sha256Hex(token);

    const row = await supabaseAdmin
      .from("report_exports")
      .select("id, storage_bucket, storage_path, expires_at, revoked_at, downloaded_at, status")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (row.error) throw row.error;
    if (!row.data) return res.status(404).send("Link not found");

    if (row.data.revoked_at) return res.status(410).send("Link revoked");

    const expiresAt = new Date(row.data.expires_at);
    if (Date.now() > expiresAt.getTime()) return res.status(410).send("Link expired");

    // Stub response for now (we'll replace with redirect to signed URL next step)
    return res.json({
      ok: true,
      report_id: row.data.id,
      status: row.data.status,
      expires_at: row.data.expires_at
    });
  } catch (e: any) {
    return res.status(400).send(e?.message ?? "Bad request");
  }
});
