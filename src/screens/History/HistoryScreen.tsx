import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useActivitiesList } from "../../hooks/useActivities";
import { useEventsList } from "../../hooks/useEvents";
import { useVitalsList } from "../../hooks/useVitals";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { Fab } from "../../ui/Fab";
import { Icon } from "../../ui/Icon";
import { IconButton } from "../../ui/IconButton";
import { Icons } from "../../ui/icons";
import { theme } from "../../ui/theme";

export default function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const vitals = useVitalsList(50);
  const activities = useActivitiesList(50);
  const events = useEventsList(50);

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
            <Icon icon={Icons.history} />
            <Text style={{ fontSize: 24, fontWeight: "600" }}>History</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <IconButton
              icon={Icons.add}
              accessibilityLabel="Add vitals"
              onPress={() => navigation.navigate("AddVitals")}
            />

            <IconButton
              icon={Icons.trends}
              accessibilityLabel="Add activity"
              onPress={() => navigation.navigate("AddActivity")}
            />
          </View>
        </View>

        {/* VITALS */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon icon={Icons.dashboard} size={18} />
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Vitals</Text>
          </View>

          {vitals.isLoading ? (
            <Text>Loading vitals…</Text>
          ) : vitals.isError ? (
            <Text>Error loading vitals.</Text>
          ) : (vitals.data ?? []).length === 0 ? (
            <Text>No vitals yet.</Text>
          ) : (
            (vitals.data ?? []).map((item) => (
              <View
                key={item.id}
                style={styles.card}
              >
                <Text style={{ fontWeight: "600" }}>
                  {new Date(item.measured_at).toLocaleString()}
                </Text>
                <Text>
                  Pulse: {item.pulse_bpm ?? "-"} | BP: {item.systolic ?? "-"} /{" "}
                  {item.diastolic ?? "-"}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* ACTIVITIES */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon icon={Icons.trends} size={18} />
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Activities</Text>
          </View>

          {activities.isLoading ? (
            <Text>Loading activities…</Text>
          ) : activities.isError ? (
            <Text>Error loading activities.</Text>
          ) : (activities.data ?? []).length === 0 ? (
            <Text>No activities yet.</Text>
          ) : (
            (activities.data ?? []).map((item) => (
              <View
                key={item.id}
                style={styles.card}
              >
                <Text style={{ fontWeight: "600" }}>
                  {new Date(item.performed_at).toLocaleString()} —{" "}
                  {item.activity_type}
                </Text>
                <Text>
                  Duration: {item.duration_minutes ?? "-"} min | Distance:{" "}
                  {item.distance_km ?? "-"} km | Floors: {item.floors ?? "-"}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* EVENTS */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon icon={Icons.report} size={18} />
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Events</Text>
          </View>

          {events.isLoading ? (
            <Text>Loading events…</Text>
          ) : events.isError ? (
            <Text>Error loading events.</Text>
          ) : (events.data ?? []).length === 0 ? (
            <Text>No events yet.</Text>
          ) : (
            (events.data ?? []).map((item) => (
              <View
                key={item.id}
                style={styles.card}
              >
                <Text style={{ fontWeight: "600" }}>
                  {new Date(item.event_at).toLocaleString()} — {item.title}
                </Text>
                {!!item.notes && <Text>Notes: {item.notes}</Text>}
              </View>
            ))
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
    gap: 14,
    paddingBottom: theme.spacing.fabBottomPadding,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing.cardPadding,
  },
});