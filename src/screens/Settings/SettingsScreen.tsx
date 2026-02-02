import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { supabase } from "../../services/supabase";
import { Fab } from "../../ui/Fab";
import { Icon } from "../../ui/Icon";
import { IconButton } from "../../ui/IconButton";
import { Icons } from "../../ui/icons";
import { theme } from "../../ui/theme";

const onLogout = async () => {
  await supabase.auth.signOut();
};

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
            <Icon icon={Icons.settings} />
            <Text style={{ fontSize: 24, fontWeight: "600" }}>Settings</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
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

        <View style={[styles.card, styles.cardGap8]}>
          <Text style={{ fontWeight: "600" }}>Account</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
            <IconButton
              icon={Icons.settings}
              accessibilityLabel="Sign out"
              onPress={() => {
                Alert.alert(
                  "Sign out",
                  "Are you sure you want to sign out?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Sign out", style: "destructive", onPress: onLogout },
                  ]
                );
              }}
            />
            <Text style={{ color: "#DC2626", fontWeight: "600" }}>Sign out</Text>
          </View>
        </View>

        <View style={[styles.card, styles.cardGap8]}>
          <Text style={{ fontWeight: "600" }}>About</Text>
          <Text>Lung Tracker</Text>
          <Text>Version 1.0.0</Text>
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
    gap: 16,
    paddingBottom: theme.spacing.fabBottomPadding,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing.cardPadding,
  },
  cardGap8: {
    gap: 8,
  },
});