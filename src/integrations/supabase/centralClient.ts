import { createClient } from "@supabase/supabase-js";

const CENTRAL_SUPABASE_URL = "https://bzptxnbrexatoqflybrq.supabase.co";
const CENTRAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cHR4bmJyZXhhdG9xZmx5YnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODQ3NzQsImV4cCI6MjA4OTg2MDc3NH0.w-LmvDz6qhNJJxAMjDLQmnSupzA6IczhDVXui8PelzQ";

/**
 * Client pointing to the CENTRALIZED Supabase project.
 * Used exclusively for authentication (login, logout, session)
 * and querying the central `profiles` table.
 */
export const centralSupabase = createClient(
  CENTRAL_SUPABASE_URL,
  CENTRAL_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
