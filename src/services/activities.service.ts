import { Activity, CreateActivityInput } from "../models/activity";
import { supabase } from "./supabase";

const TABLE = "activities";

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

export async function createActivity(input: CreateActivityInput): Promise<Activity> {
  const userId = await requireUserId();

  const payload = {
    user_id: userId,
    activity_type: input.activity_type,
    performed_at: input.performed_at,

    duration_minutes: input.duration_minutes ?? null,
    distance_km: input.distance_km ?? null,
    floors: input.floors ?? null,
    symptom_score: input.symptom_score ?? null,

    notes: input.notes ?? null,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Activity;
}

export async function listActivities(limit = 50): Promise<Activity[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("performed_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Activity[];
}

export async function getLatestActivity(activityType?: string): Promise<Activity | null> {
  let q = supabase
    .from(TABLE)
    .select("*")
    .order("performed_at", { ascending: false })
    .limit(1);

  if (activityType) q = q.eq("activity_type", activityType);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Activity[];
  return rows[0] ?? null;
}