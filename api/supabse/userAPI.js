import { supabase } from "./client.js";

export const getUserInfo = async (room_id) => {
  let { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id, user_nickname")
    .eq("room_id)", room_id);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
