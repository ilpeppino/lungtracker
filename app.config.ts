export default {
  expo: {
    name: "Lung Tracker",
    slug: "lung-tracker",
    scheme: "lungtracker",

    android: {
      package: "com.lungtracker.app",
    },

    web: {
      basePath: "/lungtracker",
    },

    // Optional now, but strongly recommended to add immediately
    // so iOS builds won't fail later.
    ios: {
      bundleIdentifier: "com.lungtracker.app",
    },

    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "b5a22156-7e2c-4914-b36d-74959b9bea63",
      },
    },
  },
};
