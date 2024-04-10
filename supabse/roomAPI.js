import { supabase } from "./client.js";

export const getUserCountInRoom = async (room_id) => {
  const { data, error } = await supabase
    .from("room_table")
    .select("current_user_count, total_user_count")
    .eq("room_id", room_id);
  if (error) {
    throw new Error(error.message);
  }
  return {
    total_user_count: data[0].total_user_count,
    current_user_count: data[0].current_user_count,
  };
};
