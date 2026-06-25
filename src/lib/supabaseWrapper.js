import { createClient as realCreateClient } from "@supabase/supabase-js";
import { MockSupabaseClient } from "./supabaseMockDb";

export function createClient(supabaseUrl, supabaseKey, options = {}) {
  // If SUPABASE_SERVICE_ROLE_KEY is missing, we use our MockSupabaseClient wrapper
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const realClient = realCreateClient(supabaseUrl, supabaseKey, options);
    return new MockSupabaseClient(supabaseUrl, supabaseKey, options, realClient);
  }
  
  // Otherwise, return the real client directly
  return realCreateClient(supabaseUrl, supabaseKey, options);
}
