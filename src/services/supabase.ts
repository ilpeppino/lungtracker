import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

console.log("Supabase config check:", {
  hasUrl: !!extra?.supabaseUrl,
  hasAnonKey: !!extra?.supabaseAnonKey,
  supabaseUrl: extra?.supabaseUrl,
});

if (!extra?.supabaseUrl || !extra?.supabaseAnonKey) {
  const errorMsg =
    `Supabase environment variables are missing:\n` +
    `  SUPABASE_URL: ${extra?.supabaseUrl ? 'OK' : 'MISSING'}\n` +
    `  SUPABASE_ANON_KEY: ${extra?.supabaseAnonKey ? 'OK' : 'MISSING'}\n` +
    `Make sure these are set during the EAS build process.`;

  console.error(errorMsg);
  throw new Error(errorMsg);
}

console.log("Supabase config loaded:", {
  supabaseUrl: extra.supabaseUrl,
  hasAnonKey: !!extra.supabaseAnonKey,
});

export const supabase = createClient(
  extra.supabaseUrl,
  extra.supabaseAnonKey
);