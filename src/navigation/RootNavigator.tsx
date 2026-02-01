import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import AppTabs from "./AppTabs";
import AuthStack from "./AuthStack";

export default function RootNavigator() {
  const { isAuthed, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return isAuthed ? <AppTabs /> : <AuthStack />;
}