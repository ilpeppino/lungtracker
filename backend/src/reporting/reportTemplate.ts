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
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 24px;
      color: #111;
    }

    h1, h2 {
      margin: 0 0 12px 0;
    }

    h1 {
      font-size: 22px;
    }

    h2 {
      font-size: 16px;
      margin-top: 24px;
    }

    .meta {
      margin-bottom: 18px;
      color: #444;
      font-size: 13px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 22px;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 6px 8px;
      font-size: 11px;
      vertical-align: top;
    }

    th {
      background: #f6f6f6;
      font-weight: 600;
      text-align: left;
    }

    .small {
      font-size: 11px;
      color: #666;
    }

    .section {
      margin-top: 18px;
    }
  </style>
</head>
<body>

  <h1>Lung Tracker — Health Report</h1>

  <div class="meta">
    <div><strong>Period:</strong> ${escapeHtml(rangeStart)} → ${escapeHtml(rangeEnd)}</div>
    <div class="small">Generated at ${new Date().toISOString()}</div>
  </div>

  <div class="section">
    <h2>Vitals</h2>
    <table>
      <thead>
        <tr>
          <th>Measured at</th>
          <th>Pulse (bpm)</th>
          <th>Systolic</th>
          <th>Diastolic</th>
          <th>FEV1 (L)</th>
          <th>FEV1 Pred (L)</th>
          <th>FEV1 %</th>
          <th>PEF (L/min)</th>
          <th>PEF Pred (L/min)</th>
          <th>PEF %</th>
          <th>Notes</th>
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
          <th>Performed at</th>
          <th>Type</th>
          <th>Duration (min)</th>
          <th>Distance (km)</th>
          <th>Floors</th>
          <th>Symptom score</th>
          <th>Notes</th>
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
          <th>Date</th>
          <th>Title</th>
          <th>Noticeable turn</th>
          <th>Major update</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows(events, [
          "event_at",
          "title",
          "noticeable_turn",
          "major_health_update",
          "notes"
        ])}
      </tbody>
    </table>
  </div>

</body>
</html>
`;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}