const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";

export default {
  expo: {
    name: "Lung Tracker",
    slug: "lung-tracker",
    scheme: "lungtracker",
    experiments: { baseUrl: "/lungtracker" },
    android: { package: "com.lungtracker.app" },
    ios: { bundleIdentifier: "com.lungtracker.app" },
    extra: {
      supabaseUrl,
      supabaseAnonKey,
      eas: { projectId: "b5a22156-7e2c-4914-b36d-74959b9bea63" },
    },
  },
};