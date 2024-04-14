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

export const checkPlayerCountEnough = async (room_id, total_user_count) => {
  const { count, error } = await supabase
    .from("room_user_match_table")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room_id);

  if (error) {
    throw new Error();
  }
  return total_user_count === count;
};

export const checkAllPlayersReady = async (room_id, total_user_count) => {
  const { count, error } = await supabase
    .from("room_user_match_table")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room_id)
    .eq("is_ready", true);

  if (error) {
    throw new Error();
  }
  return total_user_count === count;
};

export const getRoleCount = async (room_id, role) => {
  const { count, error } = await supabase
    .from("room_user_match_table")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room_id)
    .eq("role", role);

  if (error) {
    throw new Error();
  }
  return count;
};

export const setPlayerRole = async (user_id, role) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({ role })
    .eq("user_id", user_id);

  if (error) {
    throw new Error();
  }
};

export const getPlayerByRole = async (room_id, role) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id")
    .eq("room_id", room_id)
    .eq("role", role)
    .eq("is_lived", true);

  if (error) {
    throw new Error();
  }

  if (data.length === 0) {
    return null;
  }

  const result = data.map((item) => item.user_id);

  return result;
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
    .eq("room_id", room_id)
    .order("voted_count", { ascending: false });

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
    .select("vote_to")
    .eq("room_id", room_id);

  if (error) {
    throw new Error();
  }

  const result = data.map((item) => item.vote_to);

  return result;
};

export const killPlayer = async (user_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ is_lived: false })
    .eq("user_id", user_id)
    .select("user_id")
    .single();

  if (error) {
    throw new Error();
  }

  return data.user_id;
};

export const savePlayer = async (user_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ is_lived: true })
    .eq("user_id", user_id)
    .select("user_id")
    .single();

  if (error) {
    throw new Error();
  }

  return data.user_id;
};

export const choosePlayer = async (user_id, role) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({ chosen_by: role })
    .eq("user_id", user_id);
  if (error) {
    throw new Error();
  }
};

export const checkChosenPlayer = async (room_id, role) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id")
    .eq("room_id", room_id)
    .eq("chosen_by", role);

  if (error) {
    throw new Error();
  }

  if (data.length === 0) {
    return null;
  }

  return data[0].user_id;
};

export const resetChosenPlayer = async (room_id) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({ chosen_by: null })
    .eq("room_id", room_id);

  if (error) {
    throw new Error();
  }
};

export const checkPlayerLived = async (user_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("is_lived")
    .eq("user_id", user_id)
    .single();

  if (error) {
    throw new Error();
  }

  return data.is_lived;
};
