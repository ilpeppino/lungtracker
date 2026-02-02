export function computeReportSummary(input) {
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
function buildMetricSummary(rows, tsKey, valueKey) {
    const points = rows
        .map((r) => {
        const iso = normalizeIso(r?.[tsKey]);
        const t = iso ? Date.parse(iso) : NaN;
        const v = toNumber(r?.[valueKey]);
        if (!iso || !Number.isFinite(t) || v === null)
            return null;
        return { x: t, y: v, iso };
    })
        .filter((p) => !!p)
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
function classifyTrend(slopePerDay) {
    // PoC thresholds; adjust later
    const eps = 0.001;
    if (slopePerDay > eps)
        return "up";
    if (slopePerDay < -eps)
        return "down";
    return "flat";
}
function linearSlopePerDay(points) {
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
    if (den === 0)
        return 0;
    const bPerMs = num / den;
    const msPerDay = 24 * 60 * 60 * 1000;
    return bPerMs * msPerDay;
}
function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function round(n, digits) {
    const p = Math.pow(10, digits);
    return Math.round(n * p) / p;
}
function toNumber(v) {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
}
function normalizeIso(v) {
    if (!v)
        return null;
    if (typeof v === "string")
        return v;
    if (v instanceof Date)
        return v.toISOString();
    return null;
}
