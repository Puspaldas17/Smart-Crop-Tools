import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[supabase] SUPABASE_URL or SUPABASE_ANON_KEY not set. Authentication will not work until configured.",
  );
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : ({
        from: () => ({
          select: () => Promise.reject(new Error("Supabase not configured")),
          insert: () => Promise.reject(new Error("Supabase not configured")),
          update: () => Promise.reject(new Error("Supabase not configured")),
          eq: () => ({
            select: () => Promise.reject(new Error("Supabase not configured")),
          }),
        }),
      } as any);

export async function initSupabaseSchema() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        "[supabase] Cannot initialize schema: Supabase not configured",
      );
      return;
    }
    const { error: createTableError } = await supabase.rpc("init_schema");
    if (createTableError) {
      console.warn(
        "[supabase] Schema already exists or init_schema not available",
      );
    }
  } catch (e) {
    console.warn("[supabase] Could not initialize schema:", e);
  }
}
