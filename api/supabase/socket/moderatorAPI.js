import { getPlayerByRole, getVoteYesOrNoResult } from "../gamePlayAPI.js";

//NOTE - 클라이언트의 화면에 모달창을 띄움
export const showModal = (
  mafiaIo,
  roomName,
  eventName,
  title,
  message,
  timer,
  nickname,
  yesOrNo
) => {
  mafiaIo
    .to(roomName)
    .emit(eventName, title, message, timer, nickname, yesOrNo);
};

//NOTE - 참가자들 랜덤으로 섞기(피셔-예이츠 셔플 알고리즘)
export const shufflePlayers = (allPlayers) => {
  for (let i = allPlayers.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
  }
  return allPlayers;
};

//NOTE - 플레이어에게 다른 플레이어의 역할 공개
export const openPlayerRole = (mafiaIo, clientUserId, roleUserId, role) => {
  mafiaIo.to(clientUserId).emit("openPlayerRole", roleUserId, role);
};

//NOTE - 표를 가장 많이 받은 플레이어 확인
export const getMostVotedPlayer = (voteBoard) => {
  let isValid;

  isValid = voteBoard[0].voted_count !== voteBoard[1].voted_count;

  return { isValid, result: voteBoard[0] };
};

//NOTE - 유저들에게 마피아 지목 투표 결과 보여줌
export const showVoteToResult = (mafiaIo, eventName, roomId, voteBoard) => {
  mafiaIo.to(roomId).emit(eventName, voteBoard);
};

//NOTE - 찬성 반대 투표 결과
export const getYesOrNoVoteResult = async (roomId) => {
  const votes = await getVoteYesOrNoResult(roomId);
  let yesCount = 0;
  let noCount = 0;
  let isValid;

  votes.forEach((vote) => {
    if (vote === true) {
      yesCount++;
    } else if (vote === false) {
      noCount++;
    }
  });

  isValid = yesCount !== noCount;

  return {
    isValid,
    result: yesCount > noCount,
    detail: { yesCount, noCount },
  };
};

//NOTE - 유저들에게 찬성/반대 투표 결과 보여줌
export const showVoteYesOrNoResult = async (
  mafiaIo,
  roomId,
  eventName,
  voteResult
) => {
  mafiaIo.to(roomId).emit(eventName, voteResult);
};

//NOTE - 어느 팀이 이겼는지 결과 반환
export const whoWins = async (roomId) => {
  const mafiaPlayers = await getPlayerByRole(roomId, "마피아");
  const citizenPlayers = await getPlayerByRole(roomId, "시민");
  let mafiaCount;
  let citizenCount;

  if (mafiaPlayers) {
    mafiaCount = mafiaPlayers.length;
  } else {
    mafiaCount = 0;
  }

  if (citizenPlayers) {
    citizenCount = citizenPlayers.length;
  } else {
    mafiaCount = 0;
  }

  if (mafiaCount === 0) {
    return { isValid: true, result: "시민" };
  }
  if (mafiaCount > citizenCount || mafiaCount === citizenCount) {
    return { isValid: true, result: "마피아" };
  }

  return { isValid: false };
};

export const showWhoWins = async (gameOver) => {
  console.log("showWhoWins 송신");

  //NOTE - 게임 종료 만족하는 지
  console.log(`${gameOver.result}팀이 이겼습니다.`);
  showModal(
    mafiaIo,
    roomId,
    "gameOver",
    "제목",
    `${gameOver.result}팀이 이겼습니다.`,
    500,
    "닉네임",
    false
  );
};

export const updateUserInRoom = async (roomId) => {
  console.log("updateUserInRoom 송신");
  try {
    const playerInfo = await getCurrentUserDisplay(roomId);
    mafiaIo.to(roomId).emit("updateUserInRoom", playerInfo);
  } catch (error) {
    console.log("updateUserInRoom 에러 발생");
  }
};
