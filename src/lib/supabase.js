import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.SUPABASE_URL ?? "";
const anonKey = import.meta.env.SUPABASE_ANON_KEY ?? "";

/** Käytössä vain jos tuot importin; pääsovellus luo clientin suoraan main.js:ssä. */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;
