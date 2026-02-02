import {
    Clock,
    FileText,
    LayoutDashboard,
    Plus,
    Settings,
    TrendingUp,
} from "lucide-react-native";

/**
 * Semantic icon mapping for the app.
 * Use these keys everywhere instead of importing icons directly.
 */
export const Icons = {
  dashboard: LayoutDashboard,
  trends: TrendingUp,
  history: Clock,
  report: FileText,
  settings: Settings,
  add: Plus,
} as const;