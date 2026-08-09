import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Supabase browser authentication is not configured.");
}

// This client deliberately accepts only public browser configuration.
// Service-role credentials must never be imported into the web application.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
