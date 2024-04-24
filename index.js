//NOTE - 네임스페이스, 룸 구현

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  createRoom,
  exitRoom,
  fastJoinRoom,
  getRooms,
  getUserCountInRoom,
  getUserIdInRoom,
  getUserInfoInRoom,
  joinRoom,
} from "./api/supabase/roomAPI.js";
import {
  checkAllPlayersReady,
  checkChosenPlayer,
  checkPlayerCountEnough,
  checkPlayerLived,
  checkPlayerMafia,
  choosePlayer,
  getPlayerByRole,
  getPlayerNickname,
  getRoleMaxCount,
  getStatus,
  getVoteToResult,
  killPlayer,
  savePlayer,
  setPlayerRole,
  setReady,
  voteTo,
  voteYesOrNo,
} from "./api/supabase/gamePlayAPI.js";
import {
  getMostVotedPlayer,
  getYesOrNoVoteResult,
  showModal,
  showVoteToResult,
  showVoteYesOrNoResult,
  shufflePlayers,
  whoWins,
} from "./api/supabase/socket/moderatorAPI.js";

const app = express();
const httpServer = createServer(app);
const port = 4000;
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const mafiaIo = io.of("/mafia");

app.get("/", (req, res) => {
  res.send("express 서버와 연결되어 있습니다.");
});

mafiaIo.on("connection", (socket) => {
  socket.join("0ed9a099-f1b4-46eb-a187-2da752eed29c");

  socket.on("enterMafia", async (rowStart, rowEnd) => {
    console.log(`[enterMafia] rowStart : ${rowStart}, rowEnd : ${rowEnd}`);
    try {
      const rooms = await getRooms(rowStart, rowEnd);
      socket.emit("enterMafia", rooms);
    } catch (error) {
      console.log("[enterMafiaError] 방 목록을 불러오는데 실패했습니다.");
      socket.emit("enterMafiaError", "방 목록을 불러오는데 실패했습니다.");
    }
  });

  socket.on("createRoom", async (title, game_category, total_user_count) => {
    console.log(
      `[createRoom] title : ${title}, game_category : ${game_category}, total_user_count : ${total_user_count}`
    );
    try {
      const room = await createRoom(title, game_category, total_user_count);
      socket.emit("createRoom", room);
    } catch (error) {
      console.log("[createRoomError] 방을 생성하는데 실패했습니다.");
      socket.emit("createRoomError", "방을 생성하는데 실패했습니다.");
    }
  });

  socket.on("joinRoom", async (userId, roomId, nickname) => {
    console.log(
      `[joinRoom] userId : ${userId}, roomId : ${roomId}, nickname : ${nickname}`
    );
    try {
      socket.join(roomId);
      socket.join(userId);

      await joinRoom(roomId, userId, nickname);
      const userInfo = await getUserInfoInRoom(roomId);

      mafiaIo.to(roomId).emit("joinRoom", userInfo);
    } catch (error) {
      console.log("[joinRoomError] 방 입장에 실패했습니다.");
      socket.emit("joinRoomError", "방 입장에 실패했습니다.");
    }
  });

  socket.on("fastJoinRoom", async (userId, nickname) => {
    console.log(`[fastJoinRoom] userId : ${userId}, nickname : ${nickname}`);
    try {
      const roomId = await fastJoinRoom(userId, nickname);
      socket.join(roomId);

      const userInfo = await getUserInfoInRoom(roomId);

      mafiaIo.to(roomId).emit("fastJoinRoom", roomId, userInfo);
    } catch (error) {
      console.log("[fastJoinRoomError] 빠른 방 입장에 실패했습니다.");
      socket.emit("fastJoinRoomError", "빠른 방 입장에 실패했습니다.");
    }
  });

  socket.on("exitRoom", async (roomId, userId) => {
    console.log(`[exitRoom] roomId : ${roomId}, userId : ${userId}`);
    try {
      await exitRoom(roomId, userId);

      const userInfo = await getUserInfoInRoom(roomId);

      mafiaIo.to(roomId).emit("exitRoom", userInfo);
    } catch (error) {
      console.log("[exitRoomError] 방에서 나가기에 실패했습니다.");
      socket.emit("exitRoomError", "방에서 나가기에 실패했습니다.");
    }
  });

  socket.on("setReady", async (userId, ready, roomId) => {
    console.log(
      `[setReady] userId : ${userId}, ready : ${ready}, roomId : ${roomId}`
    );
    try {
      const result = await setReady(userId, ready);
      if (result.length === 0) {
        throw new Error();
      }
      console.log("ready하는데 성공했습니다.");
      mafiaIo.to(roomId).emit("updateUserReady", userId, ready);
      canGameStart(roomId);
    } catch (error) {
      console.log("[setReadyError] 레디를 설정하는데 실패했습니다.");
      socket.emit("setReadyError", "레디를  설정하는데 실패했습니다.");
    }
  });

  socket.on("voteTo", async (userId) => {
    console.log(`[voteTo] UserId : ${userId}`);

    try {
      await voteTo(userId);
      socket.emit("voteTo", "투표하는데 성공했습니다.");
    } catch (error) {
      console.log("[voteToError] 투표하는데 실패했습니다.");
      socket.emit("voteToError", "투표하는데 실패했습니다.");
    }
  });

  socket.on("voteYesOrNo", async (userId, yesOrNo) => {
    console.log(`[voteYesOrNo] userId : ${userId}, yesOrNo : ${yesOrNo}`);

    try {
      await voteYesOrNo(userId, yesOrNo);
      socket.emit("voteYesOrNo", "찬성/반대 투표하는데 성공했습니다.");
    } catch (error) {
      console.log("[voteYesOrNoError] 찬성/반대 투표하는데 실패했습니다.");
      socket.emit("voteYesOrNoError", "찬성/반대 투표하는데 실패했습니다.");
    }
  });

  socket.on("choosePlayer", async (userId, role) => {
    console.log(`[choosePlayer] userId : ${userId}, role : ${role} `);

    try {
      await choosePlayer(userId, role);
      socket.emit(
        "choosePlayer",
        "역할을 수행할 대상을 정하는데 성공했습니다."
      );
    } catch (error) {
      console.log(
        "[choosePlayerError] 역할을 수행할 대상을 정하는데 실패했습니다."
      );
      socket.emit(
        "choosePlayerError",
        "역할을 수행할 대상을 정하는데 실패했습니다."
      );
    }
  });

  socket.on("exit", (nickname) => {
    socket.broadcast.emit("server", `${nickname}님이 나가셨습니다.`);
  });

  socket.on("r0NightStart", async (roomId) => {
    console.log("r0NightStart 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(roomId, "r0NightStart", total_user_count);

    if (isDone) {
      r0TurnAllUserCameraMikeOff(roomId);
    } else {
      console.log("r0NightStart 준비 X");
    }
  });

  socket.on("r0TurnAllUserCameraMikeOff", async (roomId) => {
    console.log("r0TurnAllUserCameraMikeOff 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r0TurnAllUserCameraMikeOff",
      total_user_count
    );

    if (isDone) {
      r0SetAllUserRole(roomId);
    } else {
      console.log("r0TurnAllUserCameraMikeOff 준비 X");
    }
  });

  socket.on("r0SetAllUserRole", async (roomId) => {
    console.log("r0SetAllUserRole 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r0SetAllUserRole",
      total_user_count
    );

    if (isDone) {
      r0ShowAllUserRole(roomId);
    } else {
      console.log("r0SetAllUserRole 준비 X");
    }
  });

  socket.on("r0ShowAllUserRole", async (roomId) => {
    console.log("r0ShowAllUserRole 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r0ShowAllUserRole",
      total_user_count
    );

    if (isDone) {
      r0ShowMafiaUserEachOther(roomId);
    } else {
      console.log("r0ShowAllUserRole 준비 X");
    }
  });

  socket.on("r0ShowMafiaUserEachOther", async (roomId) => {
    console.log("r0ShowMafiaUserEachOther 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r0ShowMafiaUserEachOther",
      total_user_count
    );

    if (isDone) {
      r0TurnMafiaUserCameraOn(roomId);
    } else {
      console.log("r0ShowMafiaUserEachOther 준비 X");
    }
  });

  socket.on("r0TurnMafiaUserCameraOn", async (roomId) => {
    console.log("r0TurnMafiaUserCameraOn 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r0TurnMafiaUserCameraOn",
      total_user_count
    );

    if (isDone) {
      r0TurnMafiaUserCameraOff(roomId);
    } else {
      console.log("r0TurnMafiaUserCameraOn 준비 X");
    }
  });

  socket.on("r0TurnMafiaUserCameraOff", async (roomId) => {
    console.log("r0TurnMafiaUserCameraOff 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r0TurnMafiaUserCameraOff",
      total_user_count
    );

    if (isDone) {
      r1MorningStart(roomId);
    } else {
      console.log("r0TurnMafiaUserCameraOff 준비 X");
    }
  });

  socket.on("r1MorningStart", async (roomId) => {
    console.log("r1MorningStart 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(roomId, "r1MorningStart", total_user_count);

    if (isDone) {
      r1TurnAllUserCameraMikeOn(roomId);
    } else {
      console.log("r1MorningStart 준비 X");
    }
  });

  socket.on("r1TurnAllUserCameraMikeOn", async (roomId) => {
    console.log("r1TurnAllUserCameraMikeOn 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1TurnAllUserCameraMikeOn",
      total_user_count
    );

    if (isDone) {
      r1FindMafia(roomId);
    } else {
      console.log("r1TurnAllUserCameraMikeOn 준비 X");
    }
  });

  socket.on("r1FindMafia", async (roomId) => {
    console.log("r1FindMafia 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(roomId, "r1FindMafia", total_user_count);

    if (isDone) {
      r1MetingOver(roomId);
    } else {
      console.log("r1FindMafia 준비 X");
    }
  });

  socket.on("r1MetingOver", async (roomId) => {
    console.log("r1MetingOver 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(roomId, "r1MetingOver", total_user_count);

    if (isDone) {
      r1VoteToMafia(roomId);
    } else {
      console.log("r1MetingOver 준비 X");
    }
  });

  socket.on("r1VoteToMafia", async (roomId, votedPlayer) => {
    console.log("r1VoteToMafia 수신");

    try {
      await voteTo(votedPlayer);
    } catch (error) {
      console.log("[r1VoteToMafia] 투표하는데 실패했습니다.");
    }

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(roomId, "r1VoteToMafia", total_user_count);

    if (isDone) {
      r1ShowVoteToResult(roomId);
    } else {
      console.log("r1VoteToMafia 준비 X");
    }
  });

  socket.on("r1ShowVoteToResult", async (roomId) => {
    console.log("r1ShowVoteToResult 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1ShowVoteToResult",
      total_user_count
    );

    if (isDone) {
      r1ShowMostVotedPlayer(roomId);
    } else {
      console.log("r1ShowVoteToResult 준비 X");
    }
  });

  socket.on("r1ShowMostVotedPlayer", async (roomId, isValid) => {
    console.log("r1ShowMostVotedPlayer 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1ShowMostVotedPlayer",
      total_user_count
    );

    if (isDone && isValid) {
      console.log("유효한 투표");
      r1LastTalk(roomId);
    } else if (isDone && !isValid) {
      console.log("유효하지 않은 투표");
      r1TurnAllUserCameraMikeOff(roomId);
    } else {
      console.log("r1ShowMostVotedPlayer 준비 X");
    }
  });

  socket.on("r1LastTalk", async (roomId) => {
    console.log("r1LastTalk 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(roomId, "r1LastTalk", total_user_count);

    if (isDone) {
      r1VoteYesOrNo(roomId);
    } else {
      console.log("r1LastTalk 준비 X");
    }
  });

  socket.on("r1VoteYesOrNo", async (roomId, userId, yesOrNo) => {
    console.log("r1VoteYesOrNo 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(roomId, "r1VoteYesOrNo", total_user_count);

    try {
      await voteYesOrNo(userId, yesOrNo);
    } catch (error) {
      console.log("[r1VoteYesOrNo] 찬성/반대 투표하는데 실패했습니다.");
    }

    if (isDone) {
      r1ShowVoteYesOrNoResult(roomId);
    } else {
      console.log("r1VoteYesOrNo 준비 X");
    }
  });

  socket.on("r1ShowVoteYesOrNoResult", async (roomId) => {
    console.log("r1ShowVoteYesOrNoResult 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1ShowVoteYesOrNoResult",
      total_user_count
    );

    if (isDone) {
      r1KillMostVotedPlayer(roomId);
    } else {
      console.log("r1ShowVoteYesOrNoResult 준비 X");
    }
  });

  socket.on("r1KillMostVotedPlayer", async (roomId) => {
    console.log("r1KillMostVotedPlayer 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1KillMostVotedPlayer",
      total_user_count
    );

    if (isDone) {
      r1TurnAllUserCameraMikeOff(roomId);
    } else {
      console.log("r1KillMostVotedPlayer 준비 X");
    }
  });

  socket.on("r1TurnAllUserCameraMikeOff", async (roomId) => {
    console.log("r1TurnAllUserCameraMikeOff 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1TurnAllUserCameraMikeOff",
      total_user_count
    );

    if (isDone) {
      r1DecideMafiaToKillPlayer(roomId);
    } else {
      console.log("r1TurnAllUserCameraMikeOff 준비 X");
    }
  });

  socket.on("r1DecideMafiaToKillPlayer", async (roomId) => {
    console.log("r1DecideMafiaToKillPlayer 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1DecideMafiaToKillPlayer",
      total_user_count
    );

    if (isDone) {
      r1TurnMafiaUserCameraOn(roomId);
    } else {
      console.log("r1DecideMafiaToKillPlayer 준비 X");
    }
  });

  socket.on("r1TurnMafiaUserCameraOn", async (roomId) => {
    console.log("r1TurnMafiaUserCameraOn 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1TurnMafiaUserCameraOn",
      total_user_count
    );

    if (isDone) {
      r1GestureToMafiaEachOther(roomId);
    } else {
      console.log("r1TurnMafiaUserCameraOn 준비 X");
    }
  });

  socket.on("r1GestureToMafiaEachOther", async (roomId, userId) => {
    console.log("r1GestureToMafiaEachOther 수신");

    try {
      await choosePlayer(userId, "마피아");
    } catch (error) {
      console.log("마피아의 지목이 실했습니다.");
    }

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1GestureToMafiaEachOther",
      total_user_count
    );

    if (isDone) {
      r1TurnMafiaUserCameraOff(roomId);
    } else {
      console.log("r1GestureToMafiaEachOther 준비 X");
    }
  });

  socket.on("r1TurnMafiaUserCameraOff", async (roomId) => {
    console.log("r1TurnMafiaUserCameraOff 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1TurnMafiaUserCameraOff",
      total_user_count
    );

    if (isDone) {
      r1DecideDoctorToSavePlayer(roomId);
    } else {
      console.log("r1TurnMafiaUserCameraOff 준비 X");
    }
  });

  socket.on("r1DecideDoctorToSavePlayer", async (roomId, userId) => {
    console.log("r1DecideDoctorToSavePlayer 수신");

    try {
      if (userId) {
        await choosePlayer(userId, "의사");
      }
    } catch (error) {
      console.log("의사가 살릴 사람 지목 실패");
    }

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1DecideDoctorToSavePlayer",
      total_user_count
    );

    if (isDone) {
      r1DecidePoliceToDoubtPlayer(roomId);
    } else {
      console.log("r1DecideDoctorToSavePlayer 준비 X");
    }
  });

  socket.on("r1DecidePoliceToDoubtPlayer", async (roomId, userId) => {
    console.log("r1DecidePoliceToDoubtPlayer 수신");

    try {
      if (userId) {
        await choosePlayer(userId, "경찰");
      }
    } catch (error) {
      console.log("경찰의 지목 실패");
    }

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1DecidePoliceToDoubtPlayer",
      total_user_count
    );

    if (isDone) {
      r1ShowDoubtedPlayer(roomId);
    } else {
      console.log("r1DecidePoliceToDoubtPlayer 준비 X");
    }
  });

  socket.on("r1ShowDoubtedPlayer", async (roomId) => {
    console.log("r1ShowDoubtedPlayer 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1ShowDoubtedPlayer",
      total_user_count
    );

    if (isDone) {
      r1KillPlayerByRole(roomId);
    } else {
      console.log("r1ShowDoubtedPlayer 준비 X");
    }
  });

  socket.on("r1KillPlayerByRole", async (roomId) => {
    console.log("r1KillPlayerByRole 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1KillPlayerByRole",
      total_user_count
    );

    if (isDone) {
      r2MorningStart(roomId);
    } else {
      console.log("r1KillPlayerByRole 준비 X");
    }
  });

  socket.on("r2MorningStart", async (roomId) => {
    console.log("r2MorningStart 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(roomId, "r2MorningStart", total_user_count);

    if (isDone) {
      r2TurnAllUserCameraMikeOn(roomId);
    } else {
      console.log("r2MorningStart 준비 X");
    }
  });

  socket.on("r2TurnAllUserCameraMikeOn", async (roomId) => {
    console.log("r2TurnAllUserCameraMikeOn 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r2TurnAllUserCameraMikeOn",
      total_user_count
    );

    if (isDone) {
      r2ShowIsPlayerLived(roomId);
    } else {
      console.log("r2TurnAllUserCameraMikeOn 준비 X");
    }
  });

  socket.on("r2ShowIsPlayerLived", async (roomId) => {
    console.log("r2ShowIsPlayerLived 수신");
    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r2ShowIsPlayerLived",
      total_user_count
    );

    if (isDone) {
      r2WhoWIns(roomId); //NOTE - 테스트 코드, 1라운드 시작이 되어야 함
    } else {
      console.log("r2ShowIsPlayerLived 준비 X");
    }
  });

  socket.on("r2AskPlayerToExit", async (response) => {
    console.log("r2AskPlayerToExit 수신");

    //FIXME - 코드 보충할 것
    console.log(
      "관전하려고 하면 플레이어 죽었다고 처리, 나간다고 하면 exitRoom 실행"
    );

    if (isDone) {
      console.log("플레이어 죽음");
    } else {
      console.log("r2AskPlayerToExit 준비 X");
    }
  });

  io.on("disconnection", () => {
    console.log("클라이언트와의 연결이 끊겼습니다.");
  });
});

httpServer.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});

const canGameStart = async (roomId) => {
  console.log("게임 레디 확인");
  const { total_user_count: totalUserCount } = await getUserCountInRoom(roomId);
  console.log("총 인원 :", totalUserCount);
  console.log("룸 아이디", roomId);

  const isAllPlayerEnoughCount = await checkPlayerCountEnough(
    roomId,
    totalUserCount
  ); //NOTE - 플레이어들이 방 정원을 채웠는지
  const isAllPlayersReady = await checkAllPlayersReady(roomId, totalUserCount); //NOTE - 플레이어들이 전부 레디했는지
  const canStart = isAllPlayerEnoughCount && isAllPlayersReady;
  console.log(
    "인원 충분 :",
    isAllPlayerEnoughCount,
    " 전부 레디 :" + isAllPlayersReady
  );

  if (canStart) {
    play(roomId);
  } else {
    console.log("준비X");
  }
};

const play = (roomId) => {
  console.log("게임 시작");
  r0NightStart(roomId);
};

const r0NightStart = (roomId) => {
  console.log("r0NightStart 송신");
  showModal(
    mafiaIo,
    roomId,
    "r0NightStart",
    "제목",
    "밤이 시작되었습니다.",
    500,
    "닉네임",
    true
  );
};

const r0TurnAllUserCameraMikeOff = async (roomId) => {
  console.log("카메라, 마이크 끔");

  const allPlayers = await getUserIdInRoom(roomId);

  console.log("r0TurnAllUserCameraMikeOff 송신");
  mafiaIo.to(roomId).emit("r0TurnAllUserCameraMikeOff", allPlayers);
};

const r0SetAllUserRole = (roomId) => {
  console.log("r0SetAllUserRole 송신");
  showModal(
    mafiaIo,
    roomId,
    "r0SetAllUserRole",
    "제목",
    "역할 배정을 시작하겠습니다.",
    500,
    "닉네임",
    true
  );
};

const r0ShowAllUserRole = async (roomId) => {
  console.log("r0ShowAllUserRole 송신");
  let allPlayers = await getUserIdInRoom(roomId);
  const { total_user_count: totalUserCount } = await getUserCountInRoom(roomId);
  const maxMafiaCount = await getRoleMaxCount(totalUserCount, "mafia_count");
  const maxDoctorCount = await getRoleMaxCount(totalUserCount, "doctor_count");
  const maxPoliceCount = await getRoleMaxCount(totalUserCount, "police_count");
  let mafiaPlayers;
  let doctorPlayer;
  let policePlayer;
  let citizenPlayers;

  allPlayers = shufflePlayers(allPlayers);

  console.log("총 멤버", allPlayers);
  console.log("최대 마피아 인원 수", maxMafiaCount);
  console.log("최대 의사 인원 수", maxDoctorCount);
  console.log("최대 경찰 인원 수", maxPoliceCount);

  //NOTE - 처음에는 모든 플레이어 시민으로 설정
  for (let playerIndex = 0; playerIndex < totalUserCount; playerIndex++) {
    await setPlayerRole(allPlayers[playerIndex], "시민");
  }

  //NOTE - 마피아 인원 수만큼 플레이어들에게 마피아 역할 배정
  console.log("마피아 역할 배정");
  for (let playerIndex = 0; playerIndex < maxMafiaCount; playerIndex++) {
    await setPlayerRole(allPlayers[playerIndex], "마피아");
  }

  mafiaPlayers = await getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  console.log("방에 의사가 있다면 실행");
  if (maxDoctorCount !== 0) {
    console.log("의사 뽑음");
    await setPlayerRole(allPlayers[maxMafiaCount], "의사");
    doctorPlayer = await getPlayerByRole(roomId, "의사");
  }

  console.log("경찰이 있다면 실행");
  if (maxPoliceCount !== 0) {
    console.log("경찰 뽑음");
    await setPlayerRole(allPlayers[maxMafiaCount + 1], "경찰");
    policePlayer = await getPlayerByRole(roomId, "경찰");
  }

  citizenPlayers = await getPlayerByRole(roomId, "시민");

  let role = {};
  role["마피아"] = mafiaPlayers;
  if (doctorPlayer) {
    role["의사"] = doctorPlayer;
  }
  if (policePlayer) {
    role["경찰"] = policePlayer;
  }
  role["시민"] = citizenPlayers;
  console.log("시민 : ", role["시민"]);
  mafiaIo.to(roomId).emit("r0ShowAllUserRole", role);
};

const r0ShowMafiaUserEachOther = (roomId) => {
  console.log("r0ShowMafiaUserEachOther 송신");
  showModal(
    mafiaIo,
    roomId,
    "r0ShowMafiaUserEachOther",
    "제목",
    "마피아들은 고개를 들어 서로를 확인해 주세요.",
    500,
    "닉네임",
    true
  );
};

const r0TurnMafiaUserCameraOn = async (roomId) => {
  let mafiaPlayers = await getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 켬
  console.log("마피아 유저들의 카메라, 마이크 켬");

  console.log("r0TurnMafiaUserCameraOn 송신");
  mafiaIo.to(roomId).emit("r0TurnMafiaUserCameraOn", mafiaPlayers);
};
const r0TurnMafiaUserCameraOff = async (roomId) => {
  const mafiaPlayers = await getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 끔
  console.log("마피아 유저들의 카메라, 마이크 끔");

  console.log("r0TurnMafiaUserCameraOff 송신");
  mafiaIo.to(roomId).emit("r0TurnMafiaUserCameraOff", mafiaPlayers);
};

const r1MorningStart = (roomId) => {
  console.log("r1MorningStart 송신");
  showModal(
    mafiaIo,
    roomId,
    "r1MorningStart",
    "제목",
    "아침이 시작되었습니다.",
    500,
    "닉네임",
    false
  );
};

const r1TurnAllUserCameraMikeOn = async (roomId) => {
  console.log("r1TurnAllUserCameraMikeOn 송신");

  console.log("카메라, 마이크 켬");
  const allPlayers = await getUserIdInRoom(roomId);

  console.log("r1TurnAllUserCameraMikeOn 송신");
  mafiaIo.to(roomId).emit("r1TurnAllUserCameraMikeOn", allPlayers);
};

const r1FindMafia = (roomId) => {
  console.log("r1FindMafia 송신");

  showModal(
    mafiaIo,
    roomId,
    "r1FindMafia",
    "제목",
    "모든 유저는 토론을 통해 마피아를 찾아내세요.",
    500,
    "닉네임",
    true
  );
};

const r1MetingOver = (roomId) => {
  console.log("토론이 끝났습니다.");
  console.log("r1MetingOver 송신");

  showModal(
    mafiaIo,
    roomId,
    "r1MetingOver",
    "제목",
    "토론이 끝났습니다.",
    500,
    "닉네임",
    true
  );
};

const r1VoteToMafia = (roomId) => {
  console.log("마피아일 것 같은 사람의 화면을 클릭해주세요.");
  console.log("r1VoteToMafia 송신");

  showModal(
    mafiaIo,
    roomId,
    "r1VoteToMafia",
    "제목",
    "마피아일 것 같은 사람의 화면을 클릭해주세요.",
    500,
    "닉네임",
    true
  );
};

const r1ShowVoteToResult = async (roomId) => {
  console.log("r1ShowVoteToResult 송신");
  console.log("투표 개표");
  const voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  //await moderator.resetVote(roomId); //NOTE - 플레이어들이 한 투표 기록 리셋, 테스트용으로 잠시 주석처리

  console.log("투표 결과 전송");
  showVoteToResult(mafiaIo, "r1ShowVoteToResult", roomId, voteBoard);
};

const r1ShowMostVotedPlayer = async (roomId) => {
  console.log("r1ShowMostVotedPlayer 송신");
  const voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  const mostVoteResult = getMostVotedPlayer(voteBoard); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)

  if (mostVoteResult.isValid) {
    console.log("투표 성공");
    //NOTE - 투표 성공
    console.log(
      `${mostVoteResult.result.user_nickname}님이 마피아로 지목되었습니다.`
    );
    mafiaIo
      .to(roomId)
      .emit(
        "r1ShowMostVotedPlayer",
        "제목",
        `${mostVoteResult.result.user_nickname}님이 마피아로 지목되었습니다.`,
        500,
        "닉네임",
        true,
        true
      );
  } else {
    mafiaIo
      .to(roomId)
      .emit(
        "r1ShowMostVotedPlayer",
        "제목",
        "투표가 유효하지 않습니다.",
        500,
        "닉네임",
        true,
        false
      );
  }
};

const r1LastTalk = async (roomId) => {
  console.log("r1LastTalk 송신");
  const voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  const mostVoteResult = getMostVotedPlayer(voteBoard); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)
  console.log(
    `${mostVoteResult.result.user_nickname}님은 최후의 변론을 시작하세요.`
  );
  showModal(
    mafiaIo,
    roomId,
    "r1LastTalk",
    "제목",
    `${mostVoteResult.result.user_nickname}님은 최후의 변론을 시작하세요.`,
    500,
    "닉네임",
    false
  );
};

const r1VoteYesOrNo = (roomId) => {
  console.log("r1VoteYesOrNo 송신");
  console.log("찬성/반대 투표를 해주세요.");
  showModal(
    mafiaIo,
    roomId,
    "r1VoteYesOrNo",
    "제목",
    "찬성/반대 투표를 해주세요.",
    500,
    "닉네임",
    false
  );
};

const r1ShowVoteYesOrNoResult = async (roomId) => {
  console.log("투표 결과 나옴");
  const yesOrNoVoteResult = await getYesOrNoVoteResult(roomId); //NOTE - 찬반 투표 결과 (확정X, 동률 나올 수 있음)
  showVoteYesOrNoResult(
    mafiaIo,
    roomId,
    "r1ShowVoteYesOrNoResult",
    yesOrNoVoteResult.detail
  ); //NOTE - 투표 결과를 방의 유저들에게 보여줌
  // await moderator.resetVote(roomId); //NOTE - 투표 결과 리셋, 테스트 상 주석};
};

const r1KillMostVotedPlayer = async (roomId) => {
  console.log("r1KillMostVotedPlayer 송신");

  const voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  const mostVoteResult = getMostVotedPlayer(voteBoard); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)
  const yesOrNoVoteResult = await getYesOrNoVoteResult(roomId); //NOTE - 찬반 투표 결과 (확정X, 동률 나올 수 있음)

  if (yesOrNoVoteResult.isValid && yesOrNoVoteResult.result) {
    console.log("투표 결과 죽일 플레이어 나옴");
    const killedPlayer = await killPlayer(mostVoteResult.result.user_id); //NOTE - 투표를 가장 많이 받은 플레이어 사망
    const isPlayerMafia = await checkPlayerMafia(killedPlayer); //NOTE - 죽은 플레이어가 마피아인지 확인

    //NOTE - 죽은 플레이어가 마피아인지 시민인지 알림
    if (isPlayerMafia) {
      console.log("마피아가 죽었습니다.");
      mafiaIo
        .to(roomId)
        .emit(
          "r1KillMostVotedPlayer",
          "제목",
          "마피아가 죽었습니다.",
          500,
          "닉네임",
          false,
          killedPlayer,
          "마피아"
        );
    } else {
      console.log("시민이 죽었습니다.");
      mafiaIo
        .to(roomId)
        .emit(
          "r1KillMostVotedPlayer",
          "제목",
          "시민이 죽었습니다.",
          500,
          "닉네임",
          false,
          killedPlayer,
          "시민"
        );
    }
  } else {
    //NOTE - 투표 실패, 동률이 나옴
    console.log("동률 나옴");
    showModal(
      mafiaIo,
      roomId,
      r1KillMostVotedPlayer,
      "제목",
      "동률 나옴",
      500,
      "닉네임",
      false
    );
  }
};

const r1TurnAllUserCameraMikeOff = async (roomId) => {
  console.log("r1TurnAllUserCameraMikeOff 송신");
  //NOTE - 모든 플레이어들의 카메라와 마이크 끔
  console.log("카메라, 마이크 끔");
  const allPlayers = await getUserIdInRoom(roomId);
  mafiaIo.to(roomId).emit("r1TurnAllUserCameraMikeOff", allPlayers);
};
const r1DecideMafiaToKillPlayer = (roomId) => {
  console.log("r1DecideMafiaToKillPlayer 송신");
  console.log("마피아는 누구를 죽일지 결정해주세요.");
  showModal(
    mafiaIo,
    roomId,
    "r1DecideMafiaToKillPlayer",
    "제목",
    "마피아는 누구를 죽일지 결정해주세요.",
    500,
    "닉네임",
    false
  );
};

const r1TurnMafiaUserCameraOn = async (roomId) => {
  console.log("r1TurnMafiaUserCameraOn 송신");
  const mafiaPlayers = await getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라 켬
  console.log("마피아 유저들의 카메라켬");
  mafiaIo.to(roomId).emit("r1TurnMafiaUserCameraOn", mafiaPlayers);
};

const r1GestureToMafiaEachOther = async (roomId) => {
  console.log("r1GestureToMafiaEachOther 송신");
  console.log("누구를 죽일지 제스처를 통해 상의하세요.");

  const mafiaPlayers = await getPlayerByRole(roomId, "마피아");

  mafiaIo
    .to(roomId)
    .emit(
      "r1GestureToMafiaEachOther",
      "제목",
      "누구를 죽일지 제스처를 통해 상의하세요.",
      0,
      "닉네임",
      false,
      mafiaPlayers
    );
};

const r1TurnMafiaUserCameraOff = async (roomId) => {
  //NOTE - 마피아 유저들 화면의 마피아 유저 카메라 끔
  console.log("r1TurnMafiaUserCameraOff 송신");
  console.log("마피아 유저들의 카메라 끔");
  const mafiaPlayers = await getPlayerByRole(roomId, "마피아");
  mafiaIo.to(roomId).emit("r1TurnMafiaUserCameraOff", mafiaPlayers);
};

const r1DecideDoctorToSavePlayer = async (roomId) => {
  console.log("r1DecideDoctorToSavePlayer 송신");

  //NOTE - 방 구성인원 중 의사가 있을 경우
  console.log("의사 역할이 방에 있다면 실행");
  const { total_user_count: totalUserCount } = await getUserCountInRoom(roomId);
  const maxDoctorCount = await getRoleMaxCount(totalUserCount, "doctor_count");
  if (maxDoctorCount !== 0) {
    showModal(
      mafiaIo,
      roomId,
      "r1DecideDoctorToSavePlayer",
      "제목",
      "의사는 누구를 살릴 지 결정하세요.",
      500,
      "닉네임",
      false
    );
  } else {
    showModal(
      mafiaIo,
      roomId,
      "r1DecideDoctorToSavePlayer",
      "제목",
      "의사가 없습니다.",
      500,
      "닉네임",
      false
    );
  }
};

const r1DecidePoliceToDoubtPlayer = async (roomId) => {
  //NOTE - 방 구성인원 중 경찰 있을 경우
  console.log("경찰역할이 방에 있다면 실행");
  const { total_user_count: totalUserCount } = await getUserCountInRoom(roomId);
  const maxPoliceCount = await getRoleMaxCount(totalUserCount, "police_count");
  if (maxPoliceCount !== 0) {
    showModal(
      mafiaIo,
      roomId,
      "r1DecidePoliceToDoubtPlayer",
      "제목",
      "경찰은 마피아 의심자를 결정해주세요.",
      500,
      "닉네임",
      false
    );
  } else {
    showModal(
      mafiaIo,
      roomId,
      "r1DecidePoliceToDoubtPlayer",
      "제목",
      "경찰이 없습니다.",
      500,
      "닉네임",
      false
    );
  }
};
const r1ShowDoubtedPlayer = async (roomId) => {
  console.log("r1ShowDoubtedPlayer 송신");
  //NOTE - 경찰이 살아있을 경우
  const policePlayer = await getPlayerByRole(roomId, "경찰");
  console.log("경찰이 살아있다면 실행");
  if (policePlayer) {
    const playerDoubted = await checkChosenPlayer(roomId, "경찰"); //NOTE - 0번 인덱스 플레이어가 마피아인지 의심
    const isPlayerMafia = await checkPlayerMafia(playerDoubted);

    if (isPlayerMafia) {
      console.log("해당 플레이어는 마피아가 맞습니다.");
      mafiaIo.to(roomId),
        emit(
          "r1ShowDoubtedPlayer",
          "제목",
          "해당 플레이어는 마피아가 맞습니다.",
          500,
          "닉네임",
          false,
          policePlayer
        );
    } else {
      console.log("해당 플레이어는 마피아가 아닙니다.");
      mafiaIo
        .to(roomId)
        .emit(
          "r1ShowDoubtedPlayer",
          "제목",
          "해당 플레이어는 마피아가 아닙니다.",
          500,
          "닉네임",
          false,
          policePlayer
        );
    }
  } else {
    console.log("경찰이 없습니다.");
    mafiaIo
      .to(roomId)
      .emit(
        "r1ShowDoubtedPlayer",
        "제목",
        "경찰이 없습니다.",
        500,
        "닉네임",
        false,
        policePlayer
      );
  }
};

const r1KillPlayerByRole = async (roomId) => {
  console.log("r1KillPlayerByRole 송신");
  const mafiaPlayers = await getPlayerByRole(roomId, "마피아");
  const doctorPlayer = await getPlayerByRole(roomId, "의사");
  const playerToKill = await checkChosenPlayer(roomId, "마피아");
  const playerToSave = await checkChosenPlayer(roomId, "의사");

  //NOTE - 죽일 플레이어와 살릴 플레이어 결정하고 생사 결정
  console.log("죽일 플레어와 살릴 플레이어 결정하고 생사 결정");
  if (playerToKill !== playerToSave) {
    if (mafiaPlayers) {
      await killPlayer(playerToKill);
    }

    if (doctorPlayer) {
      await savePlayer(playerToSave);
    }
  }
  mafiaIo.to(roomId).emit("r1KillPlayerByRole");
};

const r2MorningStart = async (roomId) => {
  console.log("r2MorningStart 송신");
  console.log("아침이 시작되었습니다.");
  showModal(
    mafiaIo,
    roomId,
    "r2MorningStart",
    "제목",
    "아침이 시작되었습니다.",
    500,
    "닉네임",
    false
  );
};

const r2TurnAllUserCameraMikeOn = async (roomId) => {
  console.log("r2TurnAllUserCameraMikeOn 송신");
  //NOTE - 모든 플레이어들의 카메라와 마이크 켬
  console.log("카메라, 마이크 켬");
  const allPlayers = await getUserIdInRoom(roomId);
  mafiaIo.to(roomId).emit("r2TurnAllUserCameraMikeOn", allPlayers);
};

const r2ShowIsPlayerLived = async (roomId) => {
  console.log("r2ShowIsPlayerLived 송신");
  const playerToKill = await checkChosenPlayer(roomId, "마피아");
  const isPlayerLived = await checkPlayerLived(playerToKill);

  if (isPlayerLived) {
    console.log("의사의 활약으로 아무도 죽지 않았습니다.");
    showModal(
      mafiaIo,
      roomId,
      "r2ShowIsPlayerLived",
      "제목",
      "의사의 활약으로 아무도 죽지 않았습니다.",
      500,
      "닉네임",
      false
    );
  } else {
    const killedPlayerNickname = await getPlayerNickname(playerToKill);
    console.log(`${killedPlayerNickname}님이 죽었습니다.`);
    showModal(
      mafiaIo,
      roomId,
      "r2ShowIsPlayerLived",
      "제목",
      `${killedPlayerNickname}님이 죽었습니다.`,
      500,
      "닉네임",
      false
    );
  }
};

const r2AskPlayerToExit = async (roomId) => {
  console.log("r2AskPlayerToExit 송신");
  const playerToKill = await checkChosenPlayer(roomId, "마피아");
  console.log("게임을 관전 하시겠습니까? 나가시겠습니까?");

  mafiaIo
    .to(roomId)
    .emit(
      "r2AskPlayerToExit",
      "제목",
      "게임을 관전 하시겠습니까? 나가시겠습니까?",
      500,
      "닉네임",
      false,
      playerToKill
    );
};

const r2WhoWIns = async (roomId) => {
  console.log("r2WhoWIns 송신");
  const gameOver = await whoWins(roomId);
  if (gameOver.isValid) {
    //NOTE - 게임 종료 만족하는 지
    console.log(`${gameOver.result}팀이 이겼습니다.`);
    showModal(
      mafiaIo,
      roomId,
      "r2WhoWIns",
      "제목",
      `${gameOver.result}팀이 이겼습니다.`,
      500,
      "닉네임",
      false
    );
  } else {
    //NOTE - 테스트 코드, 게임이 끝나지 않음
    console.log("게임이 끝나지 않음");
    showModal(
      mafiaIo,
      roomId,
      "r2WhoWIns",
      "제목",
      "게임이 끝나지 않음",
      500,
      "닉네임",
      false
    );
  }
};

const updateUserInRoom = async (roomId) => {
  console.log("updateUserInRoom 송신");
  try {
    const playerInfo = await getCurrentUserDisplay(roomId);
    mafiaIo.to(roomId).emit("updateUserInRoom", playerInfo);
  } catch (error) {
    console.log("updateUserInRoom 에러 발생");
  }
};
