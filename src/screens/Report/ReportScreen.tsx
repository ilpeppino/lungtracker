import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { Fab } from "../../ui/Fab";
import { Icon } from "../../ui/Icon";
import { IconButton } from "../../ui/IconButton";
import { Icons } from "../../ui/icons";
import { theme } from "../../ui/theme";

export default function ReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onGenerateReport = () => {
    Alert.alert(
      "Generate report",
      "This will generate a summary report of your health data.",
      [{ text: "OK" }]
    );
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
            <Icon icon={Icons.report} />
            <Text style={{ fontSize: 24, fontWeight: "600" }}>Report</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <IconButton
              icon={Icons.history}
              accessibilityLabel="Open history"
              onPress={() => navigation.navigate("History" as never)}
            />

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

        <Text style={{ fontSize: 16 }}>
          Generate and share a health report containing your vitals, activities,
          and notable events. This report can be shared with your healthcare
          provider.
        </Text>

        <View style={[styles.card, styles.cardGap8]}>
          <Text style={{ fontWeight: "600" }}>What will be included</Text>

          <Text>• Latest vitals and trends</Text>
          <Text>• Activity summaries</Text>
          <Text>• Logged health events</Text>
          <Text>• Date and time range selection</Text>
        </View>

        <View style={[styles.card, styles.cardGap10]}>
          <Text style={{ fontWeight: "600" }}>Generate</Text>
          <Text>
            When ready, generate a PDF-style report that you can download or
            share.
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 }}>
            <IconButton
              icon={Icons.report}
              accessibilityLabel="Generate report"
              onPress={onGenerateReport}
            />
            <Text style={{ color: "#2563EB", fontWeight: "600" }}>
              Generate report
            </Text>
          </View>
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
  cardGap10: {
    gap: 10,
  },
});