import { supabase } from "./supabaseClient";

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from("subscribers")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Supabase test failed:", error.message);
    return;
  }

  console.log("Supabase connection successful!");
  console.log("Query result:", data);
}