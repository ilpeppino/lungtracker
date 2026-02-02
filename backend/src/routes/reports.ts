import { Router } from "express";
import { z } from "zod";
import { requireSupabaseUser } from "../auth/supabase.js";
import { config } from "../config.js";
import { supabaseAdmin } from "../db/supabaseAdmin.js";
import { htmlToPdfBuffer } from "../reporting/pdf.js";
import { fetchReportData } from "../reporting/reportData.js";
import { renderReportHtml } from "../reporting/reportTemplate.js";
import { randomToken, sha256Hex } from "../util/crypto.js";

import { sendReportLinkEmail } from "../email/resend.js";

export const reportsRouter = Router();

const emailLinkSchema = z.object({
  rangeStart: z.string().min(1),
  rangeEnd: z.string().min(1),
  recipientEmail: z.string().email()
});

/**
 * GET /reports/exports?limit=30
 * Auth: Supabase access token
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
 * POST /reports/email-link
 * Auth: Supabase access token
 * Body: { rangeStart, rangeEnd, recipientEmail }
 *
 * Behavior:
 * - Generate PDF
 * - Upload to private Supabase Storage bucket
 * - Insert report_exports row with token hash + expiry
 * - Email recipient a secure tokenized link
 */
reportsRouter.post("/email-link", async (req, res) => {
  try {
    const { userId } = await requireSupabaseUser(req.headers.authorization);
    const body = emailLinkSchema.parse(req.body);

    const rangeStartIso = new Date(body.rangeStart).toISOString();
    const rangeEndIso = new Date(body.rangeEnd).toISOString();

    // 1) fetch report data
    const data = await fetchReportData({
      userId,
      rangeStart: rangeStartIso,
      rangeEnd: rangeEndIso
    });

    // 2) render HTML -> PDF buffer
    const html = renderReportHtml({
      rangeStart: rangeStartIso,
      rangeEnd: rangeEndIso,
      ...data
    });

    const pdfBuf = await htmlToPdfBuffer(html);

    // 3) create token + DB row
    const token = randomToken(32);
    const tokenHash = sha256Hex(token);

    const expiresAt = new Date(Date.now() + config.REPORT_LINK_TTL_SECONDS * 1000);
    const reportId = crypto.randomUUID();

    // store within bucket at path: <userId>/<reportId>.pdf
    const storageBucket = config.SUPABASE_REPORTS_BUCKET;
    const storagePath = `${userId}/${reportId}.pdf`;

    // 4) upload to Supabase Storage (private bucket)
    const upload = await supabaseAdmin.storage
      .from(storageBucket)
      .upload(storagePath, pdfBuf, {
        contentType: "application/pdf",
        upsert: true
      });

    if (upload.error) throw upload.error;

    // 5) insert report_exports row
    const insert = await supabaseAdmin.from("report_exports").insert({
      id: reportId,
      user_id: userId,
      range_start: rangeStartIso,
      range_end: rangeEndIso,
      storage_bucket: storageBucket,
      storage_path: storagePath,
      recipient_email: body.recipientEmail,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      status: "sent"
    });

    if (insert.error) throw insert.error;

    // 6) email secure link (tokenized endpoint)
    const base = config.PUBLIC_BASE_URL.replace(/\/$/, "");
    const link = `${base}/reports/r/${token}`;

    await sendReportLinkEmail({
      to: body.recipientEmail,
      link,
      expiresAtIso: expiresAt.toISOString()
    });

    const devReturn = process.env.DEV_RETURN_REPORT_LINK === "true";

    return res.json({
      ok: true,
      devLink: devReturn ? link : undefined,
      expiresAt: expiresAt.toISOString()
    });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message ?? "Bad request" });
  }
});

/**
 * GET /reports/r/:token
 * Public endpoint (recipient)
 *
 * Behavior:
 * - Validate token hash and expiry
 * - Create short-lived signed URL for the PDF
 * - Log download and redirect to signed URL
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

    // Create short-lived signed URL (e.g. 5 minutes)
    const signed = await supabaseAdmin.storage
      .from(row.data.storage_bucket)
      .createSignedUrl(row.data.storage_path, config.SIGNED_URL_TTL_SECONDS);

    if (signed.error) throw signed.error;

    // Log download (first time / last time)
    await supabaseAdmin
      .from("report_exports")
      .update({
        downloaded_at: new Date().toISOString(),
        status: "downloaded"
      })
      .eq("id", row.data.id);

    return res.redirect(302, signed.data.signedUrl);
  } catch (e: any) {
    return res.status(400).send(e?.message ?? "Bad request");
  }
});