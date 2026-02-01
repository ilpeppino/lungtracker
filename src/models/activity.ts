export type Activity = {
  id: string;
  user_id: string;

  activity_type: string; // e.g. walking, stairs, peloton
  performed_at: string;  // ISO timestamp

  duration_minutes: number | null;
  distance_km: number | null;
  floors: number | null;
  symptom_score: number | null;

  notes: string | null;

  created_at: string;
};

export type CreateActivityInput = {
  activity_type: string;
  performed_at: string;

  duration_minutes?: number | null;
  distance_km?: number | null;
  floors?: number | null;
  symptom_score?: number | null;

  notes?: string | null;
};