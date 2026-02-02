import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { useCreateVitals } from "../../hooks/useVitals";

function toNumberOrNull(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function AddVitalsScreen() {
  const navigation = useNavigation();
  const create = useCreateVitals();

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
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Could not save vitals.");
    }
  };

  return (
    <View style={{ padding: 16, gap: 10 }}>
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
  );
}