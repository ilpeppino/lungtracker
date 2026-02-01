export type VitalsEntry = {
  id: string;
  user_id: string;
  measured_at: string; // ISO timestamp

  pulse_bpm: number | null;
  systolic: number | null;
  diastolic: number | null;

  fev1_l: number | null;
  fev1_predicted_l: number | null;
  fev1_percent: number | null;

  pef_l_min: number | null;
  pef_predicted_l_min: number | null;
  pef_percent: number | null;

  notes: string | null;
  source: string | null;

  created_at: string;
};

export type CreateVitalsEntryInput = {
  measured_at: string;

  pulse_bpm?: number | null;
  systolic?: number | null;
  diastolic?: number | null;

  fev1_l?: number | null;
  fev1_predicted_l?: number | null;
  fev1_percent?: number | null;

  pef_l_min?: number | null;
  pef_predicted_l_min?: number | null;
  pef_percent?: number | null;

  notes?: string | null;
  source?: string | null;
};