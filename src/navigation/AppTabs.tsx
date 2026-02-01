import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import HistoryScreen from "../screens/History/HistoryScreen";
import ReportScreen from "../screens/Report/ReportScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import TrendsScreen from "../screens/Trends/TrendsScreen";

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
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Trends" component={TrendsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}