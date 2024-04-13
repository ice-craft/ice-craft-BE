import { supabase } from "./client.js";

export const setReady = async (user_id, is_ready) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ is_ready })
    .eq("user_id", user_id)
    .select();

  if (error) {
    throw new Error();
  }
  return data;
};

export const voteTo = async (user_id) => {
  const { data, selectError } = await supabase
    .from("room_user_match_table")
    .select("voted_count")
    .eq("user_id", user_id)
    .single();

  if (selectError) {
    throw new Error();
  }
  const votedCount = data.voted_count;
  console.log("투표수", votedCount);

  const { userId, updateError } = await supabase
    .from("room_user_match_table")
    .update({ voted_count: votedCount + 1 })
    .eq("user_id", user_id);

  if (updateError) {
    throw new Error();
  }

  return userId;
};

export const resetVote = async (room_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ vote_to: null, voted_count: 0 })
    .eq("room_id", room_id)
    .select();

  if (error) {
    throw new Error();
  }

  return data;
};

export const getVoteToResult = async (room_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id, user_nickname, voted_count")
    .eq("room_id", room_id);

  if (error) {
    throw new Error();
  }

  return data;
};

export const voteYesOrNo = async (user_id, yesOrNo) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ vote_to: yesOrNo })
    .eq("user_id", user_id)
    .select();

  if (error) {
    throw new Error();
  }

  return data;
};

export const getVoteYesOrNoResult = async (room_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id, user_nickname, vote_to")
    .eq("room_id", room_id);

  if (error) {
    throw new Error();
  }

  return data;
};

export const choosePlayer = async (user_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ vote_to: user_id })
    .eq("user_id", user_id)
    .select();

  if (error) {
    throw new Error();
  }

  return data;
};

export const checkChosenPlayer = async (room_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id")
    .eq("room_id", room_id)
    .neq("vote_to", null);

  if (error) {
    throw new Error();
  }

  return data;
};
