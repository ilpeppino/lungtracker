export function renderReportHtml(input: {
  rangeStart: string;
  rangeEnd: string;
  vitals: any[];
  activities: any[];
  events: any[];
}) {
  const { rangeStart, rangeEnd, vitals, activities, events } = input;

  const rows = (items: any[], cols: string[]) =>
    items
      .map(
        (it) =>
          `<tr>${cols
            .map((c) => `<td>${escapeHtml(String(it?.[c] ?? ""))}</td>`)
            .join("")}</tr>`
      )
      .join("");

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Lung Tracker Report</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; }
    h1,h2 { margin: 0 0 12px 0; }
    .meta { margin-bottom: 18px; color: #444; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 22px; }
    th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
    th { background: #f6f6f6; text-align: left; }
    .small { font-size: 11px; color: #666; }
    .section { margin-top: 18px; }
  </style>
</head>
<body>
  <h1>Lung Tracker — Report</h1>
  <div class="meta">
    <div><b>Range:</b> ${escapeHtml(rangeStart)} → ${escapeHtml(rangeEnd)}</div>
    <div class="small">Generated: ${new Date().toISOString()}</div>
  </div>

  <div class="section">
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
  </div>

  <div class="section">
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
  </div>

  <div class="section">
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

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
