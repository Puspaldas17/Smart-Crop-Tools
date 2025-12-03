import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initSupabaseSchema() {
  try {
    const { error: createTableError } = await supabase.rpc(
      "init_schema",
    );
    if (createTableError) {
      console.warn(
        "[supabase] Schema already exists or init_schema not available"
      );
    }
  } catch (e) {
    console.warn("[supabase] Could not initialize schema:", e);
  }
}
