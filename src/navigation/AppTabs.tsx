import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import HistoryScreen from "../screens/History/HistoryScreen";
import ReportScreen from "../screens/Report/ReportScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import TrendsScreen from "../screens/Trends/TrendsScreen";

import { Icon } from "../ui/Icon";
import { Icons } from "../ui/icons";
import { theme } from "../ui/theme";

export type AppTabParamList = {
  Dashboard: undefined;
  Trends: undefined;
  History: undefined;
  Report: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();


export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // ---- spacing + style tuning to match thin-outline icon UI ----
        tabBarStyle: {
          height: theme.tabBar.height,
          paddingTop: theme.tabBar.paddingTop,
          paddingBottom: theme.tabBar.paddingBottom,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        tabBarLabelStyle: {
          fontSize: theme.tabBar.labelSize,
          marginTop: theme.tabBar.labelMarginTop,
        },
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,

        tabBarIcon: ({ color }) => {
          const icon =
            route.name === "Dashboard"
              ? Icons.dashboard
              : route.name === "Trends"
              ? Icons.trends
              : route.name === "History"
              ? Icons.history
              : route.name === "Report"
              ? Icons.report
              : Icons.settings;

          return (
            <Icon
              icon={icon}
              size={theme.icon.size}
              strokeWidth={theme.icon.stroke}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Trends" component={TrendsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}