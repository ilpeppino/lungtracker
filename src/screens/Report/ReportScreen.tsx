import { Button, Text, View } from "react-native";

export default function ReportScreen() {
  const onGenerateReport = () => {
    console.log("Generate report (POC)");
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>
        Report
      </Text>

      <Text style={{ marginTop: 12, marginBottom: 16 }}>
        Generate and share a health report.
      </Text>

      <Button title="Generate report" onPress={onGenerateReport} />
    </View>
  );
}