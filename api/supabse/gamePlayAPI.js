import { supabase } from "./client.js";

export const setReady = async (user_id, is_ready) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ is_ready })
    .eq("user_id", user_id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
