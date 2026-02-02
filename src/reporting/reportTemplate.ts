import type { ReportSummary } from "./stats.js";
import { renderLineChartSvg } from "./charts.js";

export function renderReportHtml(input: {
  rangeStart: string;
  rangeEnd: string;
  vitals: any[];
  activities: any[];
  events: any[];
  summary: ReportSummary;
}) {
  const { rangeStart, rangeEnd, vitals, activities, events, summary } = input;

  const rows = (items: any[], cols: string[]) =>
    items
      .map(
        (it) =>
          `<tr>${cols
            .map((c) => `<td>${escapeHtml(String(it?.[c] ?? ""))}</td>`)
            .join("")}</tr>`
      )
      .join("");

  const trendArrow = (t: string) => {
    if (t === "up") return "↑";
    if (t === "down") return "↓";
    if (t === "flat") return "→";
    return "–";
  };

  const fev1 = summary.fev1_l;
  const pef = summary.pef_l_min;

  const fev1Chart = renderLineChartSvg({
    title: "FEV1 over time",
    unit: "L",
    points: fev1.points
  });

  const pefChart = renderLineChartSvg({
    title: "PEF over time",
    unit: "L/min",
    points: pef.points
  });

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Lung Tracker Report</title>
  <style>
    @page { size: A4; margin: 16mm 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111; }

    .page { page-break-after: always; }
    .page:last-child { page-break-after: auto; }

    h1 { margin: 0 0 10px 0; font-size: 24px; }
    h2 { margin: 18px 0 10px 0; font-size: 16px; }
    .muted { color: #666; font-size: 12px; }

    .cover {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    .cover-card {
      border: 1px solid #eee;
      border-radius: 10px;
      padding: 14px;
      background: #fafafa;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 10px;
    }

    .stat {
      border: 1px solid #eee;
      border-radius: 10px;
      padding: 12px;
      background: #fff;
    }

    .stat-title { font-size: 12px; color: #666; margin-bottom: 6px; }
    .stat-value { font-size: 20px; font-weight: 700; }
    .stat-sub { font-size: 11px; color: #666; margin-top: 6px; line-height: 1.3; }

    .charts { margin-top: 12px; }
    .chart-empty { font-size: 12px; color: #666; border: 1px dashed #ddd; padding: 10px; border-radius: 8px; }

    table { width: 100%; border-collapse: collapse; margin: 10px 0 18px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 11px; vertical-align: top; }
    th { background: #f6f6f6; font-weight: 600; text-align: left; }

    .section { margin-top: 10px; }
  </style>
</head>

<body>

  <!-- COVER PAGE -->
  <div class="page">
    <div class="cover">
      <div>
        <h1>Lung Tracker — Health Report</h1>
        <div class="cover-card">
          <div><b>Period:</b> ${escapeHtml(rangeStart)} → ${escapeHtml(rangeEnd)}</div>
          <div class="muted">Generated at ${escapeHtml(new Date().toISOString())}</div>
          <div class="muted">Entries: vitals ${summary.counts.vitals}, activities ${summary.counts.activities}, events ${summary.counts.events}</div>
        </div>

        <h2>Summary</h2>
        <div class="grid">
          ${renderMetricCard("FEV1", "L", fev1, trendArrow)}
          ${renderMetricCard("PEF", "L/min", pef, trendArrow)}
        </div>

        <h2>Charts</h2>
        <div class="charts">
          ${fev1Chart}
          <div style="height: 10px"></div>
          ${pefChart}
        </div>
      </div>

      <div class="muted">
        Confidential medical information. Share only with intended recipients.
      </div>
    </div>
  </div>

  <!-- DETAILS PAGES -->
  <div class="page">
    <h2>Vitals</h2>
    <table>
      <thead>
        <tr>
          <th>measured_at</th>
          <th>pulse_bpm</th>
          <th>systolic</th>
          <th>diastolic</th>
          <th>fev1_l</th>
          <th>fev1_predicted_l</th>
          <th>fev1_percent</th>
          <th>pef_l_min</th>
          <th>pef_predicted_l_min</th>
          <th>pef_percent</th>
          <th>notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows(vitals, [
          "measured_at",
          "pulse_bpm",
          "systolic",
          "diastolic",
          "fev1_l",
          "fev1_predicted_l",
          "fev1_percent",
          "pef_l_min",
          "pef_predicted_l_min",
          "pef_percent",
          "notes"
        ])}
      </tbody>
    </table>

    <h2>Activities</h2>
    <table>
      <thead>
        <tr>
          <th>performed_at</th>
          <th>activity_type</th>
          <th>duration_minutes</th>
          <th>distance_km</th>
          <th>floors</th>
          <th>symptom_score</th>
          <th>notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows(activities, [
          "performed_at",
          "activity_type",
          "duration_minutes",
          "distance_km",
          "floors",
          "symptom_score",
          "notes"
        ])}
      </tbody>
    </table>

    <h2>Events</h2>
    <table>
      <thead>
        <tr>
          <th>event_at</th>
          <th>title</th>
          <th>noticeable_turn</th>
          <th>major_health_update</th>
          <th>notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows(events, ["event_at", "title", "noticeable_turn", "major_health_update", "notes"])}
      </tbody>
    </table>
  </div>

</body>
</html>
`;
}

function renderMetricCard(
  label: string,
  unit: string,
  metric: {
    avg: number | null;
    best: { value: number; iso: string } | null;
    worst: { value: number; iso: string } | null;
    trend: "up" | "down" | "flat" | "n/a";
    slopePerDay: number | null;
  },
  trendArrow: (t: string) => string
) {
  const avg = metric.avg === null ? "–" : `${metric.avg} ${unit}`;
  const arrow = trendArrow(metric.trend);
  const slope = metric.slopePerDay === null ? "–" : `${metric.slopePerDay}/${unit}/day`.replace("//", "/");
  const best = metric.best ? `${metric.best.value} (${metric.best.iso})` : "–";
  const worst = metric.worst ? `${metric.worst.value} (${metric.worst.iso})` : "–";

  return `
<div class="stat">
  <div class="stat-title">${escapeHtml(label)} average</div>
  <div class="stat-value">${escapeHtml(avg)} <span class="muted">${escapeHtml(arrow)}</span></div>
  <div class="stat-sub">
    <div><b>Trend:</b> ${escapeHtml(metric.trend)} (${escapeHtml(slope)})</div>
    <div><b>Best:</b> ${escapeHtml(best)}</div>
    <div><b>Worst:</b> ${escapeHtml(worst)}</div>
  </div>
</div>
`.trim();
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
