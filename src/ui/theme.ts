// src/ui/theme.ts

export const theme = {
  colors: {
    // neutrals
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
    background: "#F9FAFB",
    surface: "#FFFFFF",

    // semantic
    primary: "#111827",
    link: "#2563EB",
    danger: "#DC2626",

    // tabs
    tabActive: "#111827",
    tabInactive: "#9CA3AF",

    // fab
    fabBackground: "#111827",
    fabIcon: "#FFFFFF",
  },

  typography: {
    titleSize: 24,
    titleWeight: "600" as const,
    sectionTitleSize: 18,
    sectionTitleWeight: "600" as const,
    bodySize: 16,
  },

  spacing: {
    screenPadding: 16,
    cardPadding: 12,
    gap: 12,
    gapSm: 8,
    fabBottomPadding: 96, // padding to avoid content hidden behind FAB
  },

  radius: {
    card: 8,
    fab: 27,
  },

  icon: {
    size: 24,
    sizeSm: 18,
    stroke: 1.75,
  },

  tabBar: {
    height: 64,
    paddingTop: 8,
    paddingBottom: 10,
    labelSize: 12,
    labelMarginTop: 2,
  },

  fab: {
    size: 54,
    iconSize: 22,
    iconStroke: 1.9,
    right: 18,
    bottom: 18,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;