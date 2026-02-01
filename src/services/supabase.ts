import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

if (!extra?.supabaseUrl || !extra?.supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing. " +
    "Check app.config.ts and .env configuration."
  );
}

console.log("Supabase config loaded:", {
  supabaseUrl: extra.supabaseUrl,
  hasAnonKey: !!extra.supabaseAnonKey,
});

export const supabase = createClient(
  extra.supabaseUrl,
  extra.supabaseAnonKey
);