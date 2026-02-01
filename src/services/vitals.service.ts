import { CreateVitalsEntryInput, VitalsEntry } from "../models/vitals";
import { supabase } from "./supabase";

const TABLE = "vitals_entries";

/**
 * IMPORTANT:
 * With your RLS policy, every row must include user_id = auth.uid().
 * So we fetch the current user and set user_id explicitly.
 */
async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

export async function createVitalsEntry(input: CreateVitalsEntryInput): Promise<VitalsEntry> {
  const userId = await requireUserId();

  const payload = {
    user_id: userId,
    measured_at: input.measured_at,

    pulse_bpm: input.pulse_bpm ?? null,
    systolic: input.systolic ?? null,
    diastolic: input.diastolic ?? null,

    fev1_l: input.fev1_l ?? null,
    fev1_predicted_l: input.fev1_predicted_l ?? null,
    fev1_percent: input.fev1_percent ?? null,

    pef_l_min: input.pef_l_min ?? null,
    pef_predicted_l_min: input.pef_predicted_l_min ?? null,
    pef_percent: input.pef_percent ?? null,

    notes: input.notes ?? null,
    source: input.source ?? "mobile",
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as VitalsEntry;
}

export async function listVitalsEntries(limit = 50): Promise<VitalsEntry[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("measured_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as VitalsEntry[];
}

export async function getLatestVitalsEntry(): Promise<VitalsEntry | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("measured_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as VitalsEntry[];
  return rows[0] ?? null;
}