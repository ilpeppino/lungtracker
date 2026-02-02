import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { useCreateEvent } from "../../hooks/useEvents";

export default function AddEventScreen() {
  const navigation = useNavigation();
  const create = useCreateEvent();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const onSave = async () => {
    try {
      await create.mutateAsync({
        event_at: new Date().toISOString(),
        title: title.trim(),
        notes: notes.trim() || null,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Could not save event.");
    }
  };

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <TextInput
        placeholder="Event title (e.g. flare-up, medication change...)"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, minHeight: 80 }}
      />

      <Button
        title={create.isPending ? "Saving…" : "Save event"}
        onPress={onSave}
        disabled={create.isPending || title.trim().length === 0}
      />
    </View>
  );
}