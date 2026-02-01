export default {
  expo: {
    name: "Lung Tracker",
    slug: "lung-tracker",
    scheme: "lungtracker",
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};