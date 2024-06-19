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
    .select("user_id, user_nickname, voted_count")
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

export const choosePlayer = async (user_id, role, date) => {
  console.log(user_id, role, date);
  const { error } = await supabase
    .from("room_user_match_table")
    .update({ chosen_by: role, choose_time: date })
    .eq("user_id", user_id);
  if (error) {
    console.log(error);
    throw new Error();
  }
};

export const checkChosenPlayer = async (room_id, role) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id")
    .eq("room_id", room_id)
    .eq("chosen_by", role)
    .order("choose_time", { ascending: true });

  if (error) {
    throw new Error();
  }

  if (data.length === 0) {
    return null;
  }

  return data[0].user_id;
};

export const checkPlayerMafia = async (user_id) => {
  if (!user_id) {
    return null;
  }

  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id")
    .eq("user_id", user_id)
    .eq("role", "마피아");

  if (error) {
    throw new Error();
  }

  if (data.length === 0) {
    return false;
  }

  return true;
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

export const getPlayerNickname = async (user_id) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_nickname")
    .eq("user_id", user_id)
    .single();

  if (error) {
    throw new Error();
  }

  return data.user_nickname;
};

export const getStatus = async (room_id, status, total_user_count) => {
  const { count, error } = await supabase
    .from("room_user_match_table")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room_id)
    .eq(status, true);

  if (error) {
    throw new Error();
  }
  return total_user_count === count;
};

export const setStatus = async (user_id, room_id, status, statusValue) => {
  const updateObj = {};
  updateObj[status] = statusValue;
  console.log(`userId : ${user_id}, roomId : ${room_id}, status : ${status}`);
  // 업데이트 하기 직전, room_user_match_table의 상태 확인(true로 체크한 개수 : ex=> 현재 3개)
  const { count: beforeCount, error: beforeCountError } = await supabase
    .from("room_user_match_table")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room_id)
    .eq(status, true);

  if (beforeCountError) {
    throw new Error();
  }

  const { error: setError } = await supabase
    .from("room_user_match_table")
    .update(updateObj)
    .eq("user_id", user_id)
    .select();

  // commit, rollback

  // 업데이트 하고 나서, room_user_match_table의 상태 확인(true로 체크한 개수 : ex => 현재 4개)
  // 근데, 만약 4개가 아님??? -> rollback(원래대로 돌려)

  if (setError) {
    throw new Error();
  }

  const { count: afterCount, afterCountError } = await supabase
    .from("room_user_match_table")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room_id)
    .eq(status, true);

  if (afterCountError) {
    throw new Error();
  }

  if (Math.abs(afterCount - beforeCount) > 1) {
    console.log(beforeCount, afterCount);
    updateObj[status] = !statusValue;
    const { error: setRollbackError } = await supabase
      .from("room_user_match_table")
      .update(updateObj)
      .eq("user_id", user_id)
      .select();

    if (setRollbackError) {
      console.log(setRollbackError);
      throw new Error();
    }
    return false;
  } else {
    return true;
  }
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

export const resetRoundR0 = async (room_id) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({
      r0NightStart: false,
      r0TurnAllUserCameraMikeOff: false,
      r0SetAllUserRole: false,
      r0ShowAllUserRole: false,
      r0ShowMafiaUserEachOther: false,
      r0TurnMafiaUserCameraOn: false,
      r0TurnMafiaUserCameraOff: false,
    })
    .eq("room_id", room_id);

  if (error) {
    throw new Error();
  }
};

export const resetRoundR1 = async (room_id) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({
      r1MorningStart: false,
      r1TurnAllUserCameraMikeOn: false,
      r1FindMafia: false,
      r1MetingOver: false,
      r1VoteToMafia: false,
      r1ShowVoteToResult: false,
      r1ShowMostVotedPlayer: false,
      r1LastTalk: false,
      r1VoteYesOrNo: false,
      r1ShowVoteYesOrNoResult: false,
      r1KillMostVotedPlayer: false,
      r1TurnAllUserCameraMikeOff: false,
      r1DecideMafiaToKillPlayer: false,
      r1TurnMafiaUserCameraOn: false,
      r1GestureToMafiaEachOther: false,
      r1TurnMafiaUserCameraOff: false,
      r1DecideDoctorToSavePlayer: false,
      r1DecidePoliceToDoubtPlayer: false,
      r1ShowDoubtedPlayer: false,
      r1KillPlayerByRole: false,
    })
    .eq("room_id", room_id);

  if (error) {
    throw new Error();
  }
};

export const resetRoundR2 = async (room_id) => {
  const { error } = await supabase
    .from("room_user_match_table")
    .update({
      r2MorningStart: false,
      r2TurnAllUserCameraMikeOn: false,
      r2ShowIsPlayerLived: false,
    })
    .eq("room_id", room_id);

  if (error) {
    throw new Error();
  }
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
      selected_by: null,
    })
    .eq("room_id", room_id);

  if (error) {
    throw new Error("플레이어의 상태 초기화 실패");
  }
};

export const getRound = async (room_id) => {
  const { data, error } = await supabase
    .from("room_table")
    .select("round")
    .eq("room_id", room_id)
    .single();

  if (error) {
    throw new Error();
  }

  return data.round;
};

export const updateRound = async (room_id, round) => {
  const { error } = await supabase
    .from("room_table")
    .update({
      round,
    })
    .eq("room_id", room_id);

  if (error) {
    throw new Error();
  }

  return round;
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
    .update({ selected_by: "의사" })
    .eq("user_id", user_id);
  if (error) {
    throw new Error();
  }
};

export const getSelectedPlayer = async (room_id, role) => {
  const { data, error } = await supabase
    .from("room_user_match_table")
    .select("user_id")
    .eq("room_id", room_id)
    .eq("selected_by", role);

  if (error) {
    throw new Error();
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
