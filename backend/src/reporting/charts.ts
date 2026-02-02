import type { MetricPoint } from "./stats.js";

export function renderLineChartSvg(params: {
  title: string;
  unit: string;
  points: MetricPoint[];
  width?: number;
  height?: number;
}) {
  const width = params.width ?? 720;
  const height = params.height ?? 180;
  const pad = 24;

  const pts = params.points;
  if (!pts || pts.length < 2) {
    return `<div class="chart-empty">Not enough data to render chart</div>`;
  }

  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMinRaw = Math.min(...ys);
  const yMaxRaw = Math.max(...ys);

  // add padding to y-range so a flat line is visible
  const yPad = (yMaxRaw - yMinRaw) * 0.1 || (Math.abs(yMinRaw) * 0.05) || 1;
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;

  const xScale = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - pad * 2);
  const yScale = (y: number) => height - pad - ((y - yMin) / (yMax - yMin)) * (height - pad * 2);

  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.x).toFixed(2)} ${yScale(p.y).toFixed(2)}`)
    .join(" ");

  // y-axis labels (min / mid / max)
  const yMid = (yMin + yMax) / 2;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(
    params.title
  )}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
  <text x="${pad}" y="${pad - 6}" font-size="12" fill="#111" font-weight="600">${escapeText(params.title)}</text>
  <text x="${width - pad}" y="${pad - 6}" font-size="10" fill="#666" text-anchor="end">${escapeText(
    params.unit
  )}</text>

  <!-- grid -->
  ${gridLine(width, height, pad, yScale(yMin), "#eee")}
  ${gridLine(width, height, pad, yScale(yMid), "#eee")}
  ${gridLine(width, height, pad, yScale(yMax), "#eee")}

  <!-- y labels -->
  ${yLabel(pad, yScale(yMax), yMax)}
  ${yLabel(pad, yScale(yMid), yMid)}
  ${yLabel(pad, yScale(yMin), yMin)}

  <!-- line -->
  <path d="${d}" fill="none" stroke="#111" stroke-width="2" />

  <!-- points -->
  ${pts
    .map((p) => `<circle cx="${xScale(p.x).toFixed(2)}" cy="${yScale(p.y).toFixed(2)}" r="2.5" fill="#111" />`)
    .join("")}
</svg>
`.trim();
}

function gridLine(width: number, height: number, pad: number, y: number, color: string) {
  const yy = y.toFixed(2);
  return `<line x1="${pad}" x2="${width - pad}" y1="${yy}" y2="${yy}" stroke="${color}" stroke-width="1" />`;
}

function yLabel(x: number, y: number, value: number) {
  return `<text x="${x}" y="${(y - 4).toFixed(2)}" font-size="10" fill="#666">${format(value)}</text>`;
}

function format(n: number) {
  // keep labels compact
  const abs = Math.abs(n);
  if (abs >= 100) return n.toFixed(0);
  if (abs >= 10) return n.toFixed(1);
  return n.toFixed(2);
}

function escapeText(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(s: string) {
  return escapeText(s);
}
