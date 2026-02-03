import { NavigationContainer } from "@react-navigation/native";
import { Text, View } from "react-native";
import RootNavigator from "./navigation/RootNavigator";

export default function App() {
  try {
    return (
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 16, backgroundColor: "#f5f5f5" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "red", marginBottom: 12 }}>
          Initialization Error
        </Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
          {message}
        </Text>
        <Text style={{ fontSize: 12, color: "#999" }}>
          Check console logs for more details.
        </Text>
      </View>
    );
  }
}