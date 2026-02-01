export type Event = {
  id: string;
  user_id: string;

  event_at: string; // ISO timestamp
  title: string;
  notes: string | null;

  noticeable_turn: boolean | null;
  major_health_update: boolean | null;

  created_at: string;
};

export type CreateEventInput = {
  event_at: string;
  title: string;

  notes?: string | null;
  noticeable_turn?: boolean | null;
  major_health_update?: boolean | null;
};