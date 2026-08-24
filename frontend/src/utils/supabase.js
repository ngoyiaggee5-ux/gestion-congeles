import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export async function checkSupabaseConnection() {
  if (!supabase) return { ok: false, message: "Supabase non configuré" };

  const { error } = await supabase.from("users").select("id", { count: "exact", head: true });
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true, message: "Connecté à Supabase" };
}
