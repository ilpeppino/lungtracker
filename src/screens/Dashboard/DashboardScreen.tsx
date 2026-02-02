import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreateActivity, useLatestActivity } from "../../hooks/useActivities";
import { useCreateEvent, useLatestEvent } from "../../hooks/useEvents";
import { useCreateVitals, useLatestVitals } from "../../hooks/useVitals";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { Fab } from "../../ui/Fab";
import { Icon } from "../../ui/Icon";
import { IconButton } from "../../ui/IconButton";
import { Icons } from "../../ui/icons";
import { theme } from "../../ui/theme";

function toNumberOrNull(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const latest = useLatestVitals();
  const create = useCreateVitals();

  // --- Activities (latest + quick add)
  const latestActivity = useLatestActivity();
  const createActivity = useCreateActivity();

  const [type, setType] = useState("walking");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [floors, setFloors] = useState("");

  const onSaveActivity = async () => {
    try {
      await createActivity.mutateAsync({
        activity_type: type,
        performed_at: new Date().toISOString(),
        duration_minutes: toNumberOrNull(duration),
        distance_km: toNumberOrNull(distance),
        floors: toNumberOrNull(floors),
        notes: null,
      });

      setDuration("");
      setDistance("");
      setFloors("");
      Alert.alert("Saved", "Activity created.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Unknown error");
    }
  };

  // --- Events (latest + quick add)
  const latestEvent = useLatestEvent();
  const createEvent = useCreateEvent();

  const [eventTitle, setEventTitle] = useState("");
  const [eventNotes, setEventNotes] = useState("");

  const onSaveEvent = async () => {
    const title = eventTitle.trim();
    if (!title) {
      Alert.alert("Missing title", "Please enter an event title.");
      return;
    }

    try {
      await createEvent.mutateAsync({
        event_at: new Date().toISOString(),
        title,
        notes: eventNotes.trim() ? eventNotes.trim() : null,
        noticeable_turn: false,
        major_health_update: false,
      });

      setEventTitle("");
      setEventNotes("");
      Alert.alert("Saved", "Event created.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Unknown error");
    }
  };

  const [pulse, setPulse] = useState("");
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");

  const onSave = async () => {
    try {
      await create.mutateAsync({
        measured_at: new Date().toISOString(),
        pulse_bpm: toNumberOrNull(pulse),
        systolic: toNumberOrNull(sys),
        diastolic: toNumberOrNull(dia),
        source: "mobile",
      });

      setPulse("");
      setSys("");
      setDia("");
      Alert.alert("Saved", "Vitals entry created.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Unknown error");
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Icon icon={Icons.dashboard} />
            <Text style={{ fontSize: 24, fontWeight: "600" }}>Dashboard</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <IconButton
              icon={Icons.history}
              accessibilityLabel="Open history"
              onPress={() => navigation.navigate("History" as never)}
            />

            <IconButton
              icon={Icons.add}
              accessibilityLabel="Add vitals"
              onPress={() => navigation.navigate("AddVitals")}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={{ fontWeight: "600", marginBottom: 6 }}>
            Latest Vitals
          </Text>

          {latest.isLoading ? (
            <Text>Loading…</Text>
          ) : latest.data ? (
            <Text>
              {new Date(latest.data.measured_at).toLocaleString()} — Pulse:{" "}
              {latest.data.pulse_bpm ?? "-"} | BP: {latest.data.systolic ?? "-"}
              /{latest.data.diastolic ?? "-"}
            </Text>
          ) : (
            <Text>No vitals yet.</Text>
          )}
        </View>

        <View style={[styles.card, styles.cardGap]}>
          <Text style={{ fontWeight: "600" }}>Add Vitals (quick)</Text>

          <TextInput
            placeholder="Pulse (bpm)"
            value={pulse}
            onChangeText={setPulse}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            placeholder="Systolic"
            value={sys}
            onChangeText={setSys}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            placeholder="Diastolic"
            value={dia}
            onChangeText={setDia}
            keyboardType="numeric"
            style={styles.input}
          />

          <Button
            title={create.isPending ? "Saving…" : "Save vitals"}
            onPress={onSave}
            disabled={create.isPending}
          />
        </View>

        <View style={[styles.card, styles.cardGap]}>
          <Text style={{ fontWeight: "600" }}>Latest Activity</Text>

          {latestActivity.isLoading ? (
            <Text>Loading…</Text>
          ) : latestActivity.data ? (
            <Text>
              {new Date(latestActivity.data.performed_at).toLocaleString()} —{" "}
              {latestActivity.data.activity_type}
              {" | "}
              {latestActivity.data.duration_minutes ?? "-"} min
              {" | "}
              {latestActivity.data.distance_km ?? "-"} km
              {" | "}
              {latestActivity.data.floors ?? "-"} floors
            </Text>
          ) : (
            <Text>No activities yet.</Text>
          )}

          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Add Activity (quick)
          </Text>

          <TextInput
            placeholder="Type (walking, stairs, peloton...)"
            value={type}
            onChangeText={setType}
            style={styles.input}
          />

          <TextInput
            placeholder="Duration (minutes)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            placeholder="Distance (km)"
            value={distance}
            onChangeText={setDistance}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            placeholder="Floors (optional)"
            value={floors}
            onChangeText={setFloors}
            keyboardType="numeric"
            style={styles.input}
          />

          <Button
            title={createActivity.isPending ? "Saving…" : "Save activity"}
            onPress={onSaveActivity}
            disabled={createActivity.isPending}
          />
        </View>

        <View style={[styles.card, styles.cardGap]}>
          <Text style={{ fontWeight: "600" }}>Latest Event</Text>

          {latestEvent.isLoading ? (
            <Text>Loading…</Text>
          ) : latestEvent.data ? (
            <Text>
              {new Date(latestEvent.data.event_at).toLocaleString()} —{" "}
              {latestEvent.data.title}
            </Text>
          ) : (
            <Text>No events yet.</Text>
          )}

          <Text style={{ fontWeight: "600", marginTop: 6 }}>
            Add Event (quick)
          </Text>

          <TextInput
            placeholder="Event title (e.g. flare-up, medication change...)"
            value={eventTitle}
            onChangeText={setEventTitle}
            style={styles.input}
          />

          <TextInput
            placeholder="Notes (optional)"
            value={eventNotes}
            onChangeText={setEventNotes}
            multiline
            style={[styles.input, styles.inputMultiline]}
          />

          <Button
            title={createEvent.isPending ? "Saving…" : "Save event"}
            onPress={onSaveEvent}
            disabled={createEvent.isPending}
          />
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
  cardGap: {
    gap: 10,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  inputMultiline: {
    minHeight: 64,
    textAlignVertical: "top",
  },
});