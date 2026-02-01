import { supabase } from "../../services/supabase";
import { Text, View, Button } from "react-native";

const onLogout = async () => {
  await supabase.auth.signOut();
};

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>
        Settings
      </Text>

      <Button title="Logout" onPress={onLogout} />
    </View>
  );
}