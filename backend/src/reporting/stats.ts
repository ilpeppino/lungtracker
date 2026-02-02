type VitalRow = Record<string, any>;

export type MetricPoint = { x: number; y: number; iso: string };

export type MetricSummary = {
  avg: number | null;
  best: { value: number; iso: string } | null;
  worst: { value: number; iso: string } | null;
  trend: "up" | "down" | "flat" | "n/a";
  slopePerDay: number | null;
  points: MetricPoint[];
};

export type ReportSummary = {
  fev1_l: MetricSummary;
  pef_l_min: MetricSummary;
  counts: { vitals: number; activities: number; events: number };
};

export function computeReportSummary(input: {
  vitals: VitalRow[];
  activities: any[];
  events: any[];
}): ReportSummary {
  const { vitals, activities, events } = input;

  const fev1 = buildMetricSummary(vitals, "measured_at", "fev1_l");
  const pef = buildMetricSummary(vitals, "measured_at", "pef_l_min");

  return {
    fev1_l: fev1,
    pef_l_min: pef,
    counts: {
      vitals: vitals.length,
      activities: activities.length,
      events: events.length
    }
  };
}

function buildMetricSummary(
  rows: VitalRow[],
  tsKey: string,
  valueKey: string
): MetricSummary {
  const points = rows
    .map((r) => {
      const iso = normalizeIso(r?.[tsKey]);
      const t = iso ? Date.parse(iso) : NaN;
      const v = toNumber(r?.[valueKey]);
      if (!iso || !Number.isFinite(t) || v === null) return null;
      return { x: t, y: v, iso };
    })
    .filter((p): p is MetricPoint => !!p)
    .sort((a, b) => a.x - b.x);

  if (points.length === 0) {
    return {
      avg: null,
      best: null,
      worst: null,
      trend: "n/a",
      slopePerDay: null,
      points: []
    };
  }

  const avg = round(mean(points.map((p) => p.y)), 2);

  const bestP = points.reduce((acc, p) => (p.y > acc.y ? p : acc), points[0]);
  const worstP = points.reduce((acc, p) => (p.y < acc.y ? p : acc), points[0]);

  const slopePerDay = points.length >= 2 ? round(linearSlopePerDay(points), 4) : null;
  const trend = slopePerDay === null ? "n/a" : classifyTrend(slopePerDay);

  return {
    avg,
    best: { value: round(bestP.y, 2), iso: bestP.iso },
    worst: { value: round(worstP.y, 2), iso: worstP.iso },
    trend,
    slopePerDay,
    points
  };
}

function classifyTrend(slopePerDay: number): "up" | "down" | "flat" {
  // PoC thresholds; adjust later
  const eps = 0.001;
  if (slopePerDay > eps) return "up";
  if (slopePerDay < -eps) return "down";
  return "flat";
}

function linearSlopePerDay(points: MetricPoint[]) {
  // simple least squares fit y = a + b*x ; return b in units per day
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xBar = mean(xs);
  const yBar = mean(ys);

  let num = 0;
  let den = 0;
  for (let i = 0; i < points.length; i++) {
    const dx = xs[i] - xBar;
    num += dx * (ys[i] - yBar);
    den += dx * dx;
  }
  if (den === 0) return 0;

  const bPerMs = num / den;
  const msPerDay = 24 * 60 * 60 * 1000;
  return bPerMs * msPerDay;
}

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function round(n: number, digits: number) {
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}

function toNumber(v: any): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function normalizeIso(v: any): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  return null;
}
