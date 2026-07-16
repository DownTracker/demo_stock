// This is the client the BROWSER uses to talk to Supabase.
// It only ever gets the "anon" key, which is safe to expose publicly —
// Supabase's Row Level Security (RLS) rules (see supabase.sql) decide
// what that key is actually allowed to read or change.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash the whole app during build/dev if env vars aren't set yet —
  // just warn, so pages can still render and you can see this message.
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Add them to .env.local — see README.md."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
