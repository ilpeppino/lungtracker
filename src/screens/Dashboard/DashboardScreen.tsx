import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { useCreateActivity, useLatestActivity } from "../../hooks/useActivities";
import { useCreateEvent, useLatestEvent } from "../../hooks/useEvents";
import { useCreateVitals, useLatestVitals } from "../../hooks/useVitals";

function toNumberOrNull(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function DashboardScreen() {
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
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Dashboard</Text>

      <View style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Latest Vitals</Text>

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

      <View style={{ padding: 12, borderWidth: 1, borderRadius: 8, gap: 10 }}>
        <Text style={{ fontWeight: "600" }}>Add Vitals (quick)</Text>

        <TextInput
          placeholder="Pulse (bpm)"
          value={pulse}
          onChangeText={setPulse}
          keyboardType="numeric"
          style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
        />

        <TextInput
          placeholder="Systolic"
          value={sys}
          onChangeText={setSys}
          keyboardType="numeric"
          style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
        />

        <TextInput
          placeholder="Diastolic"
          value={dia}
          onChangeText={setDia}
          keyboardType="numeric"
          style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
        />

        <Button
          title={create.isPending ? "Saving…" : "Save vitals"}
          onPress={onSave}
          disabled={create.isPending}
        />
      </View>
      

      <View style={{ padding: 12, borderWidth: 1, borderRadius: 8, gap: 10 }}>
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

        <Text style={{ fontWeight: "600", marginTop: 6 }}>Add Activity (quick)</Text>

        <TextInput
          placeholder="Type (walking, stairs, peloton...)"
          value={type}
          onChangeText={setType}
          style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
        />

        <TextInput
          placeholder="Duration (minutes)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
        />

        <TextInput
          placeholder="Distance (km)"
          value={distance}
          onChangeText={setDistance}
          keyboardType="numeric"
          style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
        />

        <TextInput
          placeholder="Floors (optional)"
          value={floors}
          onChangeText={setFloors}
          keyboardType="numeric"
          style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
        />

        <Button
          title={createActivity.isPending ? "Saving…" : "Save activity"}
          onPress={onSaveActivity}
          disabled={createActivity.isPending}
        />
      </View>

      <View style={{ padding: 12, borderWidth: 1, borderRadius: 8, gap: 10 }}>
        <Text style={{ fontWeight: "600" }}>Latest Event</Text>

        {latestEvent.isLoading ? (
          <Text>Loading…</Text>
        ) : latestEvent.data ? (
          <Text>
            {new Date(latestEvent.data.event_at).toLocaleString()} — {latestEvent.data.title}
          </Text>
        ) : (
          <Text>No events yet.</Text>
        )}

        <Text style={{ fontWeight: "600", marginTop: 6 }}>Add Event (quick)</Text>

        <TextInput
          placeholder="Event title (e.g. flare-up, medication change...)"
          value={eventTitle}
          onChangeText={setEventTitle}
          style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
        />

        <TextInput
          placeholder="Notes (optional)"
          value={eventNotes}
          onChangeText={setEventNotes}
          multiline
          style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 64 }}
        />

        <Button
          title={createEvent.isPending ? "Saving…" : "Save event"}
          onPress={onSaveEvent}
          disabled={createEvent.isPending}
        />
      </View>
    </View>
  );
}