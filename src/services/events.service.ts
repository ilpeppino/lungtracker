import { CreateEventInput, Event } from "../models/event";
import { supabase } from "./supabase";

const TABLE = "events";

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const userId = await requireUserId();

  const payload = {
    user_id: userId,
    event_at: input.event_at,
    title: input.title,

    notes: input.notes ?? null,
    noticeable_turn: input.noticeable_turn ?? false,
    major_health_update: input.major_health_update ?? false,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Event;
}

export async function listEvents(limit = 50): Promise<Event[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("event_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Event[];
}

export async function getLatestEvent(): Promise<Event | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("event_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Event[];
  return rows[0] ?? null;
}