import { supabase } from "./client.js";

export const checkPlayerCountEnough = async (room_id, total_user_count) => {
  const { count, error } = await supabase
    .from("room_user_match_table")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room_id);

  if (error) {
    throw new Error("방의 플레이어들 인원 수 조건 만족 여부 조회 실패");
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
    throw new Error("방의 모든 플레이어들 레디 여부 조회 실패");
  }
  return total_user_count === count;
};

export const setPlayerRole = async (user_id, role) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({ role })
    .eq("user_id", user_id);

  if (error) {
    throw new Error("플레이어 역할 정하기 실패");
  }
};

export const voteTo = async (user_id, time) => {
  const { data, selectError } = await supabase
    .from("room_user_match_table")
    .select("voted_count")
    .eq("user_id", user_id)
    .single();

  if (selectError) {
    throw new Error("플레이어의 받은 투표 수 조회 실패");
  }

  const votedCount = data.voted_count;

  const { userId, updateError } = await supabase
    .from("room_user_match_table")
    .update({ voted_count: votedCount + 1, vote_time: time })
    .eq("user_id", user_id);

  if (updateError) {
    throw new Error("플레이어의 받은 투표 수 갱신 실패");
  }

  return userId;
};

export const resetVote = async (room_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ vote_yes_or_no: null, voted_count: 0, vote_time: null })
    .eq("room_id", room_id)
    .select();

  if (error) {
    throw new Error("투표 초기화 실패");
  }

  return data;
};

export const getVoteToResult = async (room_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id, user_nickname, voted_count, role, is_lived")
    .eq("room_id", room_id)
    .order("voted_count", { ascending: false })
    .order("vote_time", { ascending: true });

  if (error) {
    throw new Error("방 전체 플레이어 투표 결과 조회 실패");
  }

  return data;
};

export const voteYesOrNo = async (user_id, yesOrNo) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ vote_yes_or_no: yesOrNo })
    .eq("user_id", user_id)
    .select();

  if (error) {
    throw new Error("찬성/반대 투표 수정 실패");
  }

  return data;
};

export const getVoteYesOrNoResult = async (room_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("vote_yes_or_no")
    .eq("room_id", room_id);

  if (error) {
    throw new Error("찬성 반대 투표 결과 조회 실패");
  }

  return data.map((item) => item.vote_yes_or_no);
};

export const killPlayer = async (user_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .update({ is_lived: false })
    .eq("user_id", user_id)
    .select("user_id")
    .single();

  if (error) {
    throw new Error("플레이어 죽이기 실패");
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

export const getRoleMaxCount = async (total_user_count, role) => {
  const { data, error } = await supabase
    .from("room_composition")
    .select(role)
    .eq("total_user_count", total_user_count)
    .single();

  if (error) {
    console.log(error);
    throw new Error();
  }

  return data[role];
};

export const initGame = async (room_id) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({
      is_ready: false,
      role: "시민",
      is_lived: true,
      vote_yes_or_no: null,
      voted_count: 0,
      vote_time: null,
      is_selected: false,
    })
    .eq("room_id", room_id);

  if (error) {
    throw new Error("플레이어의 상태 초기화 실패");
  }
};

export const getPlayersInRoom = async (room_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id, user_nickname, is_lived, role")
    .eq("room_id", room_id);

  if (error) {
    throw new Error("방의 플레이어들 정보 조회 실패");
  }
  return data;
};

export const selectPlayer = async (user_id) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({ is_selected: true })
    .eq("user_id", user_id);
  if (error) {
    throw new Error("플레이어 선택 실패");
  }
};

export const resetSelectedPlayer = async (room_id) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({ is_selected: false })
    .eq("room_id", room_id);
  if (error) {
    throw new Error("플레이어 선택 초기화 실패");
  }
};

export const getSelectedPlayer = async (room_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id")
    .eq("room_id", room_id)
    .eq("is_selected", true);

  if (error) {
    throw new Error("의사에 의해 선택된 플레이어 조회 실패");
  }

  if (data.length === 0) {
    return null;
  }

  return data[0].user_id;
};

export const setReady = async (user_id, is_ready) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({ is_ready })
    .eq("user_id", user_id);
  if (error) {
    throw new Error("유저의 레디 설정 실패");
  }
};
