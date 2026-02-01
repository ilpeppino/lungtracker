import { FlatList, Text, View } from "react-native";
import { useActivitiesList } from "../../hooks/useActivities";
import { useEventsList } from "../../hooks/useEvents";
import { useVitalsList } from "../../hooks/useVitals";

export default function HistoryScreen() {
  const vitals = useVitalsList(50);
  const activities = useActivitiesList(50);
  const events = useEventsList(50);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 12 }}>
        History
      </Text>

      {vitals.isLoading ? (
        <Text>Loading…</Text>
      ) : vitals.isError ? (
        <Text>Error loading vitals.</Text>
      ) : (
        <FlatList
          data={vitals.data ?? []}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
              <Text style={{ fontWeight: "600" }}>
                {new Date(item.measured_at).toLocaleString()}
              </Text>
              <Text>
                Pulse: {item.pulse_bpm ?? "-"} | BP: {item.systolic ?? "-"} /{" "}
                {item.diastolic ?? "-"}
              </Text>
            </View>
          )}
        />
      )}

      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 24, marginBottom: 12 }}>
        Activities
      </Text>

      {activities.isLoading ? (
        <Text>Loading activities…</Text>
      ) : activities.isError ? (
        <Text>Error loading activities.</Text>
      ) : (
        <FlatList
          data={activities.data ?? []}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
              <Text style={{ fontWeight: "600" }}>
                {new Date(item.performed_at).toLocaleString()} — {item.activity_type}
              </Text>
              <Text>
                Duration: {item.duration_minutes ?? "-"} min | Distance: {item.distance_km ?? "-"} km | Floors: {item.floors ?? "-"}
              </Text>
            </View>
          )}
        />
      )}

      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 24, marginBottom: 12 }}>
        Events
      </Text>

      {events.isLoading ? (
        <Text>Loading events…</Text>
      ) : events.isError ? (
        <Text>Error loading events.</Text>
      ) : (
        <FlatList
          data={events.data ?? []}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
              <Text style={{ fontWeight: "600" }}>
                {new Date(item.event_at).toLocaleString()} — {item.title}
              </Text>
              {!!item.notes && <Text>Notes: {item.notes}</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
}