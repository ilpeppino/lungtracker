import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVitalsList } from "../../hooks/useVitals";
import { VitalsEntry } from "../../models/vitals";
import { Fab } from "../../ui/Fab";
import { Icon } from "../../ui/Icon";
import { IconButton } from "../../ui/IconButton";
import { Icons } from "../../ui/icons";
import { theme } from "../../ui/theme";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/RootNavigator";

type RangeDays = 7 | 30 | 90;
type MetricKey = "pulse_bpm" | "bp" | "fev1" | "pef";

type UnitMode = "abs" | "pct";

type VitalsNumericKey =
  | "pulse_bpm"
  | "systolic"
  | "diastolic"
  | "fev1_l"
  | "fev1_predicted_l"
  | "fev1_percent"
  | "pef_l_min"
  | "pef_predicted_l_min"
  | "pef_percent";

function rangeCutoff(days: RangeDays) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  return cutoff;
}

function getMetricLabel(metric: MetricKey, unitMode?: UnitMode) {
  switch (metric) {
    case "pulse_bpm":
      return "Pulse (bpm)";
    case "bp":
      return "Blood Pressure (sys/dia)";
    case "fev1":
      return unitMode === "pct" ? "FEV1 (% predicted)" : "FEV1 (L)";
    case "pef":
      return unitMode === "pct" ? "PEF (% predicted)" : "PEF (L/min)";
  }
}

function getMetricValue(v: VitalsEntry, metric: VitalsNumericKey): number | null {
  const val = v[metric as keyof VitalsEntry];
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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.card,
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
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.border,
        borderRadius: 8,
        backgroundColor: theme.colors.surface,
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
  series2Label,
}: {
  metric: MetricKey;
  title: string;
  chartWidth: number;
  chartPoints: { value: number; label: string }[];
  chartPoints2: { value: number; label: string }[];
  series2Label?: string;
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
        ) : chartPoints2.length > 0 ? (
          <>
            <LegendItem label={title} color={line1Color} />
            <LegendItem label={series2Label ?? "Predicted"} color={line2Color} />
          </>
        ) : (
          <LegendItem label={title} color={line1Color} />
        )}
      </View>

      <LineChart
        data={chartPoints}
        data2={chartPoints2.length > 0 ? chartPoints2 : undefined}
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
                ) : chartPoints2.length > 0 ? (
                  <>
                    <Text style={{ fontSize: 12 }}>{title}: {v1 ?? "-"}</Text>
                    <Text style={{ fontSize: 12 }}>{series2Label ?? "Predicted"}: {v2 ?? "-"}</Text>
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.max(280, Math.floor(windowWidth - 32)); // 16px padding on both sides

  const LINE1_COLOR = "#2563eb"; // systolic / single series
  const LINE2_COLOR = "#ef4444"; // diastolic

  const [rangeDays, setRangeDays] = useState<RangeDays>(30);
  const [metric, setMetric] = useState<MetricKey>("pulse_bpm");
  const [fev1Mode, setFev1Mode] = useState<UnitMode>("abs");
  const [pefMode, setPefMode] = useState<UnitMode>("abs");

  // Fetch enough rows for 90 days without paging for POC.
  const vitals = useVitalsList(300);

  const { chartPoints, chartPoints2, stats, series2Label } = useMemo(() => {
    const cutoff = rangeCutoff(rangeDays);

    const rows = (vitals.data ?? [])
      .filter((r) => new Date(r.measured_at) >= cutoff)
      .sort((a, b) => +new Date(a.measured_at) - +new Date(b.measured_at));

    const labelFor = (iso: string) => formatShortDateLabel(iso);

    // BP dual series
    const bpSys = rows
      .map((r) => {
        const value = getMetricValue(r, "systolic");
        if (value === null) return null;
        return { value, label: labelFor(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    const bpDia = rows
      .map((r) => {
        const value = getMetricValue(r, "diastolic");
        if (value === null) return null;
        return { value, label: labelFor(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    // Pulse
    const pulse = rows
      .map((r) => {
        const value = getMetricValue(r, "pulse_bpm");
        if (value === null) return null;
        return { value, label: labelFor(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    // FEV1
    const fev1Abs = rows
      .map((r) => {
        const value = getMetricValue(r, "fev1_l");
        if (value === null) return null;
        return { value, label: labelFor(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    const fev1Pred = rows
      .map((r) => {
        const value = getMetricValue(r, "fev1_predicted_l");
        if (value === null) return null;
        return { value, label: labelFor(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    const fev1Pct = rows
      .map((r) => {
        const value = getMetricValue(r, "fev1_percent");
        if (value === null) return null;
        return { value, label: labelFor(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    // PEF
    const pefAbs = rows
      .map((r) => {
        const value = getMetricValue(r, "pef_l_min");
        if (value === null) return null;
        return { value, label: labelFor(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    const pefPred = rows
      .map((r) => {
        const value = getMetricValue(r, "pef_predicted_l_min");
        if (value === null) return null;
        return { value, label: labelFor(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    const pefPct = rows
      .map((r) => {
        const value = getMetricValue(r, "pef_percent");
        if (value === null) return null;
        return { value, label: labelFor(r.measured_at) };
      })
      .filter((p): p is { value: number; label: string } => !!p);

    let series1: { value: number; label: string }[] = [];
    let series2: { value: number; label: string }[] = [];
    let s2Label: string | undefined = undefined;

    if (metric === "bp") {
      series1 = bpSys;
      series2 = bpDia;
      s2Label = "Diastolic";
    } else if (metric === "pulse_bpm") {
      series1 = pulse;
    } else if (metric === "fev1") {
      if (fev1Mode === "pct") {
        series1 = fev1Pct;
      } else {
        series1 = fev1Abs;
        series2 = fev1Pred;
        s2Label = "Predicted";
      }
    } else if (metric === "pef") {
      if (pefMode === "pct") {
        series1 = pefPct;
      } else {
        series1 = pefAbs;
        series2 = pefPred;
        s2Label = "Predicted";
      }
    }

    const MAX_LABELS = 8;
    const thinned1 = thinLabels(series1, MAX_LABELS);
    const thinned2 = series2.length > 0 ? thinLabels(series2, MAX_LABELS) : [];

    const valuesAll = [...series1.map((p) => p.value), ...series2.map((p) => p.value)];
    const min = valuesAll.length ? Math.min(...valuesAll) : null;
    const max = valuesAll.length ? Math.max(...valuesAll) : null;

    return {
      chartPoints: thinned1,
      chartPoints2: thinned2,
      series2Label: s2Label,
      stats: { count: valuesAll.length, min, max, rows: rows.length },
    };
  }, [vitals.data, rangeDays, metric, fev1Mode, pefMode]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Icon icon={Icons.trends} />
            <Text style={{ fontSize: 24, fontWeight: "600" }}>Trends</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <IconButton
              icon={Icons.history}
              accessibilityLabel="Open history"
              onPress={() => navigation.navigate("History" as never)}
            />

            <IconButton
              icon={Icons.add}
              accessibilityLabel="Quick add"
              onPress={() => {
                Alert.alert("Quick add", "Choose what you want to add:", [
                  { text: "Vitals", onPress: () => navigation.navigate("AddVitals") },
                  { text: "Activity", onPress: () => navigation.navigate("AddActivity") },
                  { text: "Event", onPress: () => navigation.navigate("AddEvent") },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            />
          </View>
        </View>

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
            <SegButton label="Pulse" active={metric === "pulse_bpm"} onPress={() => setMetric("pulse_bpm")} />
            <SegButton label="BP (sys/dia)" active={metric === "bp"} onPress={() => setMetric("bp")} />
            <SegButton label="FEV1" active={metric === "fev1"} onPress={() => setMetric("fev1")} />
            <SegButton label="PEF" active={metric === "pef"} onPress={() => setMetric("pef")} />
          </View>

          {metric === "fev1" && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <SegButton label="L" active={fev1Mode === "abs"} onPress={() => setFev1Mode("abs")} />
              <SegButton label="% predicted" active={fev1Mode === "pct"} onPress={() => setFev1Mode("pct")} />
            </View>
          )}

          {metric === "pef" && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <SegButton label="L/min" active={pefMode === "abs"} onPress={() => setPefMode("abs")} />
              <SegButton label="% predicted" active={pefMode === "pct"} onPress={() => setPefMode("pct")} />
            </View>
          )}
        </View>

        <View style={[styles.card, styles.cardGap6]}>
          <Text style={{ fontWeight: "600" }}>
            {getMetricLabel(
              metric,
              metric === "fev1" ? fev1Mode : metric === "pef" ? pefMode : undefined
            )}
          </Text>
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
              title={getMetricLabel(
                metric,
                metric === "fev1" ? fev1Mode : metric === "pef" ? pefMode : undefined
              )}
              chartWidth={chartWidth}
              chartPoints={chartPoints}
              chartPoints2={chartPoints2}
              line1Color={LINE1_COLOR}
              line2Color={LINE2_COLOR}
              series2Label={series2Label}
            />
          )}
        </View>
      </ScrollView>

      <Fab
        icon={Icons.add}
        accessibilityLabel="Quick add"
        onPress={() => {
          Alert.alert("Quick add", "Choose what you want to add:", [
            { text: "Vitals", onPress: () => navigation.navigate("AddVitals") },
            { text: "Activity", onPress: () => navigation.navigate("AddActivity") },
            { text: "Event", onPress: () => navigation.navigate("AddEvent") },
            { text: "Cancel", style: "cancel" },
          ]);
        }}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.screenPadding,
    gap: theme.spacing.gap,
    paddingBottom: theme.spacing.fabBottomPadding,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing.cardPadding,
  },
  cardGap6: {
    gap: 6,
  },
});