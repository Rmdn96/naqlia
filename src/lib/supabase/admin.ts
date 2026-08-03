import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseSecretEnvironment } from "@/config/env.server";
import type { Database } from "@/types/supabase";

export function createAdminSupabaseClient() {
  const { secretKey, url } = getSupabaseSecretEnvironment();

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
