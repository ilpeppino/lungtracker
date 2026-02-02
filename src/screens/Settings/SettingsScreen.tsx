import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { supabase } from "../../services/supabase";
import { Fab } from "../../ui/Fab";
import { Icon } from "../../ui/Icon";
import { IconButton } from "../../ui/IconButton";
import { Icons } from "../../ui/icons";
import { theme } from "../../ui/theme";


export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onLogout = async () => {
    try {
      console.log("Starting logout process...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("Sign out error:", error.message);
        Alert.alert("Sign out failed", error.message);
        return;
      }

      console.log("Sign out successful");

      // On web, reload to ensure auth state is cleared and UI updates.
      if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
        console.log("Reloading page...");
        window.location.reload();
        return;
      }

      // On native, try reloading the app via expo-updates if available to ensure UI refresh.
      try {
        const Updates = await import('expo-updates');
        if (Updates?.reloadAsync) {
          await Updates.reloadAsync();
          return;
        }
      } catch (e) {
        // ignore if expo-updates is not installed or fails
      }

      // If reload isn't possible, navigate to root which should trigger auth state update
      try {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as any }] });
      } catch (_) {
        // noop
      }
    } catch (e: any) {
      console.warn("Sign out exception:", e?.message ?? e);
      Alert.alert("Sign out failed", e?.message ?? String(e));
    }
  };

  const handleSignOutPress = () => {
    // Use native confirm on web since Alert.alert doesn't work well in web
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to sign out?");
      if (confirmed) {
        onLogout();
      }
    } else {
      Alert.alert(
        "Sign out",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign out", style: "destructive", onPress: onLogout },
        ]
      );
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
              onPress={handleSignOutPress}
            />
            <Pressable onPress={handleSignOutPress}>
              <Text style={{ color: "#DC2626", fontWeight: "600" }}>Sign out</Text>
            </Pressable>
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