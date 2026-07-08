import { createClient as realCreateClient } from '@supabase/supabase-js';

export function createClient(supabaseUrl, supabaseKey, options = {}) {
  return realCreateClient(supabaseUrl, supabaseKey, options);
}
