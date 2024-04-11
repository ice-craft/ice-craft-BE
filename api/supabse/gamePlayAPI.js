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

export const VoteTo = async (sender_user_id, receiver_user_id) => {
  const { error1 } = await supabase
    .from("room_user_match_table")
    .update({ vote_to: receiver_user_id })
    .eq("user_id", sender_user_id)
    .select();

  if (error1) {
    throw new Error(error1.message);
  }

  const { data, error2 } = await supabase
    .from("room_user_match_table")
    .select("votedCount")
    .eq("user_id", receiver_user_id);

  if (error2) {
    throw new Error(error2.message);
  }

  const { error3 } = await supabase
    .from("room_user_match_table")
    .update({ voted_count: data + 1 })
    .eq("user_id", receiver_user_id)
    .select();

  if (error3) {
    throw new Error(error2.message);
  }
};
