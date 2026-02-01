import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useVitalsList } from "../../hooks/useVitals";
import { VitalsEntry } from "../../models/vitals";

type RangeDays = 7 | 30 | 90;
type MetricKey =
  | "pulse_bpm"
  | "systolic"
  | "diastolic"
  | "bp"
  | "fev1_l"
  | "fev1_percent"
  | "pef_l_min"
  | "pef_percent";

function rangeCutoff(days: RangeDays) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  return cutoff;
}

function getMetricLabel(metric: MetricKey) {
  switch (metric) {
    case "pulse_bpm":
      return "Pulse (bpm)";
    case "systolic":
      return "Systolic";
    case "diastolic":
      return "Diastolic";
    case "bp":
      return "Blood Pressure (sys/dia)";
    case "fev1_l":
      return "FEV1 (L)";
    case "fev1_percent":
      return "FEV1 (% predicted)";
    case "pef_l_min":
      return "PEF (L/min)";
    case "pef_percent":
      return "PEF (% predicted)";
  }
}

function getMetricValue(v: VitalsEntry, metric: Exclude<MetricKey, "bp">): number | null {
  const val = v[metric];
  if (typeof val !== "number") return null;
  if (!Number.isFinite(val)) return null;
  return val;
}

function formatShortDateLabel(iso: string) {
  const d = new Date(iso);
  // dd/mm
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function thinLabels<T extends { label: string }>(points: T[], maxLabels: number) {
  if (points.length <= maxLabels) return points;
  const step = Math.ceil(points.length / maxLabels);
  return points.map((p, idx) => ({ ...p, label: idx % step === 0 || idx === points.length - 1 ? p.label : "" }));
}

function SegButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 8,
        opacity: active ? 1 : 0.6,
      }}
    >
      <Text style={{ fontWeight: active ? "600" : "400" }}>{label}</Text>
    </Pressable>
  );
}

function LegendItem({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ width: 18, height: 3, backgroundColor: color, borderRadius: 2 }} />
      <Text style={{ fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function TooltipBox({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: "white",
      }}
    >
      {children}
    </View>
  );
}

function TrendsLineChart({
  metric,
  title,
  chartWidth,
  chartPoints,
  chartPoints2,
  line1Color,
  line2Color,
}: {
  metric: MetricKey;
  title: string;
  chartWidth: number;
  chartPoints: { value: number; label: string }[];
  chartPoints2: { value: number; label: string }[];
  line1Color: string;
  line2Color: string;
}) {
  return (
    <>
      <View style={{ flexDirection: "row", gap: 16, marginTop: 8, marginBottom: 4, flexWrap: "wrap" }}>
        {metric === "bp" ? (
          <>
            <LegendItem label="Systolic" color={line1Color} />
            <LegendItem label="Diastolic" color={line2Color} />
          </>
        ) : (
          <LegendItem label={title} color={line1Color} />
        )}
      </View>

      <LineChart
        data={chartPoints}
        data2={metric === "bp" ? chartPoints2 : undefined}
        width={chartWidth}
        height={240}
        spacing={Math.max(18, Math.floor(chartWidth / 14))}
        initialSpacing={10}
        hideRules={false}
        showVerticalLines={false}
        isAnimated
        color={line1Color}
        color2={line2Color}
        pointerConfig={{
          pointerStripUptoDataPoint: true,
          pointerStripColor: "#9ca3af",
          pointerStripWidth: 2,
          strokeDashArray: [4, 6],
          pointerColor: line1Color,
          radius: 4,
          activatePointersOnLongPress: false,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: any[]) => {
            const first = items?.[0];
            const second = items?.[1];

            const label = first?.label ?? "";
            const v1 = first?.value;
            const v2 = second?.value;

            return (
              <TooltipBox>
                <Text style={{ fontSize: 12, fontWeight: "600" }}>{label}</Text>
                {metric === "bp" ? (
                  <>
                    <Text style={{ fontSize: 12 }}>Systolic: {v1 ?? "-"}</Text>
                    <Text style={{ fontSize: 12 }}>Diastolic: {v2 ?? "-"}</Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 12 }}>{title}: {v1 ?? "-"}</Text>
                )}
              </TooltipBox>
            );
          },
        }}
        yAxisLabelWidth={44}
        xAxisLabelTextStyle={{ fontSize: 10 }}
      />
    </>
  );
}

export default function TrendsScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.max(280, Math.floor(windowWidth - 32)); // 16px padding on both sides

  const LINE1_COLOR = "#2563eb"; // systolic / single series
  const LINE2_COLOR = "#ef4444"; // diastolic

  const [rangeDays, setRangeDays] = useState<RangeDays>(30);
  const [metric, setMetric] = useState<MetricKey>("pulse_bpm");

  // Fetch enough rows for 90 days without paging for POC.
  const vitals = useVitalsList(300);

  const { chartPoints, chartPoints2, stats } = useMemo(() => {
    const cutoff = rangeCutoff(rangeDays);

    const rows = (vitals.data ?? [])
      .filter((r) => new Date(r.measured_at) >= cutoff)
      // sort ascending for chart
      .sort((a, b) => +new Date(a.measured_at) - +new Date(b.measured_at));

    // Base points (single series)
    const basePoints = rows
      .map((r) => {
        const value = metric === "bp" ? null : getMetricValue(r, metric);
        if (value === null) return null;
        return { value, label: formatShortDateLabel(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    // BP dual series (systolic + diastolic)
    const bpSys = rows
      .map((r) => {
        const value = getMetricValue(r, "systolic");
        if (value === null) return null;
        return { value, label: formatShortDateLabel(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    const bpDia = rows
      .map((r) => {
        const value = getMetricValue(r, "diastolic");
        if (value === null) return null;
        return { value, label: formatShortDateLabel(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    const series1 = metric === "bp" ? bpSys : basePoints;
    const series2 = metric === "bp" ? bpDia : [];

    // Thin labels to keep x-axis readable
    const MAX_LABELS = 8;
    const thinned1 = thinLabels(series1, MAX_LABELS);
    const thinned2 = metric === "bp" ? thinLabels(series2, MAX_LABELS) : [];

    const valuesAll = [...series1.map((p) => p.value), ...series2.map((p) => p.value)];
    const min = valuesAll.length ? Math.min(...valuesAll) : null;
    const max = valuesAll.length ? Math.max(...valuesAll) : null;

    return {
      chartPoints: thinned1,
      chartPoints2: thinned2,
      stats: { count: valuesAll.length, min, max, rows: rows.length },
    };
  }, [vitals.data, rangeDays, metric]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Trends</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>Range</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <SegButton label="7d" active={rangeDays === 7} onPress={() => setRangeDays(7)} />
          <SegButton label="30d" active={rangeDays === 30} onPress={() => setRangeDays(30)} />
          <SegButton label="90d" active={rangeDays === 90} onPress={() => setRangeDays(90)} />
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>Metric</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <SegButton
            label="Pulse"
            active={metric === "pulse_bpm"}
            onPress={() => setMetric("pulse_bpm")}
          />
          <SegButton
            label="Systolic"
            active={metric === "systolic"}
            onPress={() => setMetric("systolic")}
          />
          <SegButton
            label="Diastolic"
            active={metric === "diastolic"}
            onPress={() => setMetric("diastolic")}
          />
          <SegButton
            label="BP (sys/dia)"
            active={metric === "bp"}
            onPress={() => setMetric("bp")}
          />
          <SegButton
            label="FEV1 (L)"
            active={metric === "fev1_l"}
            onPress={() => setMetric("fev1_l")}
          />
          <SegButton
            label="FEV1 (%)"
            active={metric === "fev1_percent"}
            onPress={() => setMetric("fev1_percent")}
          />
          <SegButton
            label="PEF (L/min)"
            active={metric === "pef_l_min"}
            onPress={() => setMetric("pef_l_min")}
          />
          <SegButton
            label="PEF (%)"
            active={metric === "pef_percent"}
            onPress={() => setMetric("pef_percent")}
          />
        </View>
      </View>

      <View style={{ padding: 12, borderWidth: 1, borderRadius: 8, gap: 6 }}>
        <Text style={{ fontWeight: "600" }}>{getMetricLabel(metric)}</Text>
        <Text>
          Visible rows: {stats.rows} | Plotted points: {stats.count}
          {stats.min !== null && stats.max !== null ? ` | Min: ${stats.min} | Max: ${stats.max}` : ""}
        </Text>

        {vitals.isLoading ? (
          <Text>Loading…</Text>
        ) : vitals.isError ? (
          <Text>Error loading vitals.</Text>
        ) : chartPoints.length < 2 ? (
          <Text>Not enough data to chart yet. Add a few vitals entries.</Text>
        ) : (
          <TrendsLineChart
            metric={metric}
            title={getMetricLabel(metric)}
            chartWidth={chartWidth}
            chartPoints={chartPoints}
            chartPoints2={chartPoints2}
            line1Color={LINE1_COLOR}
            line2Color={LINE2_COLOR}
          />
        )}
      </View>
    </ScrollView>
  );
}