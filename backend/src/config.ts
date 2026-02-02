import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("8080"),
  PUBLIC_BASE_URL: z.string().url(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_REPORTS_BUCKET: z.string().default("reports"),

  RESEND_API_KEY: z.string().min(1),
  REPORT_FROM_EMAIL: z.string().email(),

  REPORT_LINK_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(300)
});

export const config = envSchema.parse(process.env);
