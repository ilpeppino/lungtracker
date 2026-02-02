import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { useCreateActivity } from "../../hooks/useActivities";

function toNumberOrNull(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function AddActivityScreen() {
  const navigation = useNavigation();
  const create = useCreateActivity();

  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [floors, setFloors] = useState("");

  const onSave = async () => {
    try {
      await create.mutateAsync({
        performed_at: new Date().toISOString(),
        activity_type: type.trim() || "walking",
        duration_minutes: toNumberOrNull(duration),
        distance_km: toNumberOrNull(distance),
        floors: toNumberOrNull(floors),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Could not save activity.");
    }
  };

  return (
    <View style={{ padding: 16, gap: 10 }}>
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
        title={create.isPending ? "Saving…" : "Save activity"}
        onPress={onSave}
        disabled={create.isPending}
      />
    </View>
  );
}