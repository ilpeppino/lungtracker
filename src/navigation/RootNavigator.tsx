import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../hooks/useAuth";
import AppTabs from "./AppTabs";
import AuthStack from "./AuthStack";

import AddActivityScreen from "../screens/AddActivity/AddActivityScreen";
import AddEventScreen from "../screens/AddEvent/AddEventScreen";
import AddVitalsScreen from "../screens/AddVitals/AddVitalsScreen";

export type RootStackParamList = {
  MainTabs: undefined;
  AddVitals: undefined;
  AddActivity: undefined;
  AddEvent: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator
 *
 * - Shows AuthStack when signed out
 * - Shows AppTabs when signed in
 * - Provides top-level modal routes for FAB actions
 */
export default function RootNavigator() {
  const { isAuthed, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthed) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={AppTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AddVitals"
        component={AddVitalsScreen}
        options={{ title: "Add Vitals", presentation: "modal" }}
      />

      <Stack.Screen
        name="AddActivity"
        component={AddActivityScreen}
        options={{ title: "Add Activity", presentation: "modal" }}
      />

      <Stack.Screen
        name="AddEvent"
        component={AddEventScreen}
        options={{ title: "Add Event", presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}