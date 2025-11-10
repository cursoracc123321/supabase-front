import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type TypedSupabaseClient = SupabaseClient;

let cachedClient: SupabaseClient | undefined;

export interface SupabaseClientOptions {
  supabaseUrl?: string;
  supabaseKey?: string;
}

/**
 * Returns a memoized Supabase client configured via Vite env variables.
 * The client is cached to avoid re-creating WebSocket connections.
 */
export const getSupabaseClient = (options: SupabaseClientOptions = {}): SupabaseClient => {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = options.supabaseUrl ?? import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = options.supabaseKey ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase credentials. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  });

  return cachedClient;
};

/**
 * Immediately resolves to the shared Supabase client. Useful in contexts
 * where a promise-based API is expected.
 */
export const ensureSupabaseClient = async (
  options: SupabaseClientOptions = {},
): Promise<SupabaseClient> => getSupabaseClient(options);

