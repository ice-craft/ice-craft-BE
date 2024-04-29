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
  getCurrentUserDisplay,
  getPlayerByRole,
  getPlayerNickname,
  getRoleMaxCount,
  getStatus,
  getVoteToResult,
  killPlayer,
  resetPlayerStatus,
  resetVote,
  savePlayer,
  setPlayerRole,
  setStatus,
  voteTo,
  voteYesOrNo,
} from "./api/supabase/gamePlayAPI.js";
import {
  getMostVotedPlayer,
  getYesOrNoVoteResult,
  showVoteToResult,
  showVoteYesOrNoResult,
  showWhoWins,
  shufflePlayers,
  updateUserInRoom,
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
    socket.data.userId = userId;
    socket.data.roomId = roomId;
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
      await updateUserInRoom(mafiaIo, roomId);

      mafiaIo.to(roomId).emit("exitRoom");
    } catch (error) {
      console.log("[exitRoomError] 방에서 나가기에 실패했습니다.");
      socket.emit("exitRoomError", "방에서 나가기에 실패했습니다.");
    }
  });

  socket.on("setReady", async (userId, ready, roomId) => {
    console.log("setReady 수신");

    socket.data.userId = userId; //NOTE - 테스트용 코드
    socket.data.roomId = roomId; //NOTE - 테스트용 코드

    try {
      await setStatus(userId, roomId, "is_ready", ready);
    } catch (error) {
      console.log("[setReadyError]");
      socket.emit("setReadyError", "레디를  설정하는데 실패했습니다.");
    }
    mafiaIo.to(roomId).emit("updateUserReady", userId, ready);
    canGameStart(roomId);
  });

  socket.on("r0NightStart", async () => {
    console.log("r0NightStart 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r0NightStart", true);
      isDone = await getStatus(roomId, "r0NightStart", total_user_count); //NOTE - 테이블 락
    } catch (error) {
      console.log("[r0NightStartError]");
      socket.emit("r0NightStartError");
    }

    if (isDone) {
      r0TurnAllUserCameraMikeOff(roomId);
    } else {
      console.log("r0NightStart 준비 X");
    }
  });

  socket.on("r0TurnAllUserCameraMikeOff", async () => {
    console.log("r0TurnAllUserCameraMikeOff 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r0TurnAllUserCameraMikeOff", true);
      isDone = await getStatus(
        roomId,
        "r0TurnAllUserCameraMikeOff",
        total_user_count
      );
    } catch (error) {
      console.log("[r0TurnAllUserCameraMikeOffError]");
      socket.emit("r0TurnAllUserCameraMikeOffError");
    }

    if (isDone) {
      r0SetAllUserRole(roomId);
    } else {
      console.log("r0TurnAllUserCameraMikeOff 준비 X");
    }
  });

  socket.on("r0SetAllUserRole", async () => {
    console.log("r0SetAllUserRole 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r0SetAllUserRole", true);
      isDone = await getStatus(roomId, "r0SetAllUserRole", total_user_count);
    } catch (error) {
      console.log("[r0SetAllUserRoleError]");
      socket.emit("r0SetAllUserRoleError");
    }

    if (isDone) {
      r0ShowAllUserRole(roomId);
    } else {
      console.log("r0SetAllUserRole 준비 X");
    }
  });

  socket.on("r0ShowAllUserRole", async () => {
    console.log("r0ShowAllUserRole 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r0ShowAllUserRole", true);
      isDone = await getStatus(roomId, "r0ShowAllUserRole", total_user_count);
    } catch (error) {
      console.log("[r0ShowAllUserRoleError]");
      socket.emit("r0ShowAllUserRoleError");
    }

    if (isDone) {
      r0ShowMafiaUserEachOther(roomId);
    } else {
      console.log("r0ShowAllUserRole 준비 X");
    }
  });

  socket.on("r0ShowMafiaUserEachOther", async () => {
    console.log("r0ShowMafiaUserEachOther 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r0ShowMafiaUserEachOther", true);
      isDone = await getStatus(
        roomId,
        "r0ShowMafiaUserEachOther",
        total_user_count
      );
    } catch (error) {
      console.log("[r0ShowMafiaUserEachOtherError]");
      socket.emit("r0ShowMafiaUserEachOtherError");
    }

    if (isDone) {
      r0TurnMafiaUserCameraOn(roomId);
    } else {
      console.log("r0ShowMafiaUserEachOther 준비 X");
    }
  });

  socket.on("r0TurnMafiaUserCameraOn", async () => {
    console.log("r0TurnMafiaUserCameraOn 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r0TurnMafiaUserCameraOn", true);
      isDone = await getStatus(
        roomId,
        "r0TurnMafiaUserCameraOn",
        total_user_count
      );
    } catch (error) {
      console.log("[r0TurnMafiaUserCameraOnError]");
      socket.emit("r0TurnMafiaUserCameraOnError");
    }

    if (isDone) {
      r0TurnMafiaUserCameraOff(roomId);
    } else {
      console.log("r0TurnMafiaUserCameraOn 준비 X");
    }
  });

  socket.on("r0TurnMafiaUserCameraOff", async () => {
    console.log("r0TurnMafiaUserCameraOff 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r0TurnMafiaUserCameraOff", true);
      isDone = await getStatus(
        roomId,
        "r0TurnMafiaUserCameraOff",
        total_user_count
      );
    } catch (error) {
      console.log("[r0TurnMafiaUserCameraOffError]");
      socket.emit("r0TurnMafiaUserCameraOffError");
    }

    if (isDone) {
      r1MorningStart(roomId);
    } else {
      console.log("r0TurnMafiaUserCameraOff 준비 X");
    }
  });

  socket.on("r1MorningStart", async () => {
    console.log("r1MorningStart 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1MorningStart", true);
      isDone = await getStatus(roomId, "r1MorningStart", total_user_count);
      // await resetRoundR0(roomId);//NOTE - 테스트 중이라 주석 처리
      // await resetRoundR2(roomId); //NOTE - 테스트 중이라 주석 처리
    } catch (error) {
      console.log("[r1MorningStartError]");
      socket.emit("r1MorningStartError");
    }

    if (isDone) {
      r1TurnAllUserCameraMikeOn(roomId);
    } else {
      console.log("r1MorningStart 준비 X");
    }
  });

  socket.on("r1TurnAllUserCameraMikeOn", async () => {
    console.log("r1TurnAllUserCameraMikeOn 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1TurnAllUserCameraMikeOn", true);
      isDone = await getStatus(
        roomId,
        "r1TurnAllUserCameraMikeOn",
        total_user_count
      );
    } catch (error) {
      console.log("[r1TurnAllUserCameraMikeOnError]");
      socket.emit("r1TurnAllUserCameraMikeOnError");
    }

    if (isDone) {
      r1FindMafia(roomId);
    } else {
      console.log("r1TurnAllUserCameraMikeOn 준비 X");
    }
  });

  socket.on("r1FindMafia", async () => {
    console.log("r1FindMafia 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1FindMafia", true);
      isDone = await getStatus(roomId, "r1FindMafia", total_user_count);
    } catch (error) {
      console.log("[r1FindMafiaError]");
      socket.emit("r1FindMafiaError");
    }

    if (isDone) {
      r1MeetingOver(roomId);
    } else {
      console.log("r1FindMafia 준비 X");
    }
  });

  socket.on("r1MeetingOver", async () => {
    console.log("r1MetingOver 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1MeetingOver", true);
      isDone = await getStatus(roomId, "r1MeetingOver", total_user_count);
    } catch (error) {
      console.log("[r1MeetingOverError]");
      socket.emit("r1MeetingOverError");
    }

    if (isDone) {
      r1VoteToMafia(roomId);
    } else {
      console.log("r1MeetingOver 준비 X");
    }
  });

  socket.on("r1VoteToMafia", async (votedPlayer) => {
    console.log("r1VoteToMafia 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1VoteToMafia", true);
      isDone = await getStatus(roomId, "r1VoteToMafia", total_user_count);
      await voteTo(votedPlayer);
      console.log(`${userId}는 ${votedPlayer}에게 투표`);
    } catch (error) {
      console.log("[r1VoteToMafiaError]");
      socket.emit("r1VoteToMafiaError");
    }

    if (isDone) {
      r1ShowVoteToResult(roomId);
    } else {
      console.log("r1VoteToMafia 준비 X");
    }
  });

  socket.on("r1ShowVoteToResult", async () => {
    console.log("r1ShowVoteToResult 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1ShowVoteToResult", true);
      isDone = await getStatus(roomId, "r1ShowVoteToResult", total_user_count);
    } catch (error) {
      console.log("[r1ShowVoteToResultError]");
      socket.emit("r1ShowVoteToResultError");
    }

    if (isDone) {
      r1ShowMostVotedPlayer(roomId);
    } else {
      console.log("r1ShowVoteToResult 준비 X");
    }
  });

  socket.on("r1ShowMostVotedPlayer", async (isValid) => {
    console.log("r1ShowMostVotedPlayer 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1ShowMostVotedPlayer", true);
      isDone = await getStatus(
        roomId,
        "r1ShowMostVotedPlayer",
        total_user_count
      );
    } catch (error) {
      console.log("[r1ShowMostVotedPlayerError]");
      socket.emit("r1ShowMostVotedPlayerError");
    }

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

  socket.on("r1LastTalk", async () => {
    console.log("r1LastTalk 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1LastTalk", true);
      isDone = await getStatus(roomId, "r1LastTalk", total_user_count);
    } catch (error) {
      console.log("[r1LastTalkError]");
      socket.emit("r1LastTalkError");
    }

    if (isDone) {
      r1VoteYesOrNo(roomId);
    } else {
      console.log("r1LastTalk 준비 X");
    }
  });

  socket.on("r1VoteYesOrNo", async (yesOrNo) => {
    console.log("r1VoteYesOrNo 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1VoteYesOrNo", true);
      isDone = await getStatus(roomId, "r1VoteYesOrNo", total_user_count);
      await voteYesOrNo(userId, yesOrNo);
      console.log(`${userId}가 ${yesOrNo} 투표를 함`);
    } catch (error) {
      console.log("[r1LastTalkError]");
      socket.emit("r1LastTalkError");
    }

    if (isDone) {
      r1ShowVoteYesOrNoResult(roomId);
    } else {
      console.log("r1VoteYesOrNo 준비 X");
    }
  });

  socket.on("r1ShowVoteYesOrNoResult", async () => {
    console.log("r1ShowVoteYesOrNoResult 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1ShowVoteYesOrNoResult", true);
      isDone = await getStatus(
        roomId,
        "r1ShowVoteYesOrNoResult",
        total_user_count
      );
    } catch (error) {
      console.log("[r1ShowVoteYesOrNoResultError]");
      socket.emit("r1ShowVoteYesOrNoResultError");
    }

    if (isDone) {
      r1KillMostVotedPlayer(roomId);
    } else {
      console.log("r1ShowVoteYesOrNoResult 준비 X");
    }
  });

  socket.on("r1KillMostVotedPlayer", async () => {
    console.log("r1KillMostVotedPlayer 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, roomId, "r1KillMostVotedPlayer", true);
      isDone = await getStatus(
        roomId,
        "r1KillMostVotedPlayer",
        total_user_count
      );
    } catch (error) {
      console.log("[r1KillMostVotedPlayerError]");
      socket.emit("r1KillMostVotedPlayerError");
    }

    if (isDone) {
      r1TurnAllUserCameraMikeOff(roomId);
    } else {
      console.log("r1KillMostVotedPlayer 준비 X");
    }
  });

  socket.on("r1TurnAllUserCameraMikeOff", async () => {
    console.log("r1TurnAllUserCameraMikeOff 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r1TurnAllUserCameraMikeOff: true });
      isDone = await getStatus(
        roomId,
        "r1TurnAllUserCameraMikeOff",
        total_user_count
      );
    } catch (error) {
      console.log("[r1TurnAllUserCameraMikeOffError]");
      socket.emit("r1TurnAllUserCameraMikeOffError");
    }

    if (isDone) {
      r1DecideMafiaToKillPlayer(roomId);
    } else {
      console.log("r1TurnAllUserCameraMikeOff 준비 X");
    }
  });

  socket.on("r1DecideMafiaToKillPlayer", async () => {
    console.log("r1DecideMafiaToKillPlayer 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r1DecideMafiaToKillPlayer: true });
      isDone = await getStatus(
        roomId,
        "r1DecideMafiaToKillPlayer",
        total_user_count
      );
    } catch (error) {
      console.log("[r1DecideMafiaToKillPlayerError]");
      socket.emit("r1DecideMafiaToKillPlayerError");
    }

    if (isDone) {
      r1TurnMafiaUserCameraOn(roomId);
    } else {
      console.log("r1DecideMafiaToKillPlayer 준비 X");
    }
  });

  socket.on("r1TurnMafiaUserCameraOn", async () => {
    console.log("r1TurnMafiaUserCameraOn 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r1TurnMafiaUserCameraOn: true });
      isDone = await getStatus(
        roomId,
        "r1TurnMafiaUserCameraOn",
        total_user_count
      );
    } catch (error) {
      console.log("[r1TurnMafiaUserCameraOnError]");
      socket.emit("r1TurnMafiaUserCameraOnError");
    }

    if (isDone) {
      r1GestureToMafiaEachOther(roomId);
    } else {
      console.log("r1TurnMafiaUserCameraOn 준비 X");
    }
  });

  socket.on("r1GestureToMafiaEachOther", async (player, date) => {
    console.log("r1GestureToMafiaEachOther 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r1GestureToMafiaEachOther: true });
      isDone = await getStatus(
        roomId,
        "r1GestureToMafiaEachOther",
        total_user_count
      );
      await choosePlayer(player, "마피아", date);
    } catch (error) {
      console.log("[r1GestureToMafiaEachOtherError]");
      socket.emit("r1GestureToMafiaEachOtherError");
    }

    if (isDone) {
      r1TurnMafiaUserCameraOff(roomId);
    } else {
      console.log("r1GestureToMafiaEachOther 준비 X");
    }
  });

  socket.on("r1TurnMafiaUserCameraOff", async () => {
    console.log("r1TurnMafiaUserCameraOff 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r1TurnMafiaUserCameraOff: true });
      isDone = await getStatus(
        roomId,
        "r1TurnMafiaUserCameraOff",
        total_user_count
      );
    } catch (error) {
      console.log("[r1TurnMafiaUserCameraOffError]");
      socket.emit("r1TurnMafiaUserCameraOffError");
    }

    if (isDone) {
      r1DecideDoctorToSavePlayer(roomId);
    } else {
      console.log("r1TurnMafiaUserCameraOff 준비 X");
    }
  });

  socket.on("r1DecideDoctorToSavePlayer", async (player) => {
    console.log("r1DecideDoctorToSavePlayer 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r1DecideDoctorToSavePlayer: true });
      isDone = await getStatus(
        roomId,
        "r1DecideDoctorToSavePlayer",
        total_user_count
      );
      if (player) {
        await choosePlayer(player, "의사", new Date());
      }
    } catch (error) {
      console.log("[r1DecideDoctorToSavePlayerError]");
      socket.emit("r1DecideDoctorToSavePlayerError");
    }

    if (isDone) {
      r1DecidePoliceToDoubtPlayer(roomId);
    } else {
      console.log("r1DecideDoctorToSavePlayer 준비 X");
    }
  });

  socket.on("r1DecidePoliceToDoubtPlayer", async (player) => {
    console.log("r1DecidePoliceToDoubtPlayer 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r1DecidePoliceToDoubtPlayer: true });
      isDone = await getStatus(
        roomId,
        "r1DecidePoliceToDoubtPlayer",
        total_user_count
      );
      if (player) {
        await choosePlayer(player, "경찰", new Date());
      }
    } catch (error) {
      console.log("[r1DecidePoliceToDoubtPlayerError]");
      socket.emit("r1DecidePoliceToDoubtPlayerError");
    }

    if (isDone) {
      r1ShowDoubtedPlayer(roomId);
    } else {
      console.log("r1DecidePoliceToDoubtPlayer 준비 X");
    }
  });

  socket.on("r1ShowDoubtedPlayer", async () => {
    console.log("r1ShowDoubtedPlayer 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r1ShowDoubtedPlayer: true });
      isDone = await getStatus(roomId, "r1ShowDoubtedPlayer", total_user_count);
    } catch (error) {
      console.log("[r1ShowDoubtedPlayerError]");
      socket.emit("r1ShowDoubtedPlayerError");
    }

    if (isDone) {
      r1KillPlayerByRole(roomId);
    } else {
      console.log("r1ShowDoubtedPlayer 준비 X");
    }
  });

  socket.on("r1KillPlayerByRole", async () => {
    console.log("r1KillPlayerByRole 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r1KillPlayerByRole: true });
      isDone = await getStatus(roomId, "r1KillPlayerByRole", total_user_count);
      // await resetRoundR1(roomId); //NOTE - 테스트 용이라 주석처리
    } catch (error) {
      console.log("[r1KillPlayerByRoleError]");
      socket.emit("r1KillPlayerByRoleError");
    }

    if (isDone) {
      r2MorningStart(roomId);
    } else {
      console.log("r1KillPlayerByRole 준비 X");
    }
  });

  socket.on("r2MorningStart", async () => {
    console.log("r2MorningStart 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r2MorningStart: true });
      isDone = await getStatus(roomId, "r2MorningStart", total_user_count);
    } catch (error) {
      console.log("[r2MorningStartError]");
      socket.emit("r2MorningStartError");
    }

    if (isDone) {
      r2TurnAllUserCameraMikeOn(roomId);
    } else {
      console.log("r2MorningStart 준비 X");
    }
  });

  socket.on("r2TurnAllUserCameraMikeOn", async () => {
    console.log("r2TurnAllUserCameraMikeOn 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r2TurnAllUserCameraMikeOn: true });
      isDone = await getStatus(
        roomId,
        "r2TurnAllUserCameraMikeOn",
        total_user_count
      );
    } catch (error) {
      console.log("[r2TurnAllUserCameraMikeOnError]");
      socket.emit("r2TurnAllUserCameraMikeOnError");
    }

    if (isDone) {
      r2ShowIsPlayerLived(roomId);
    } else {
      console.log("r2TurnAllUserCameraMikeOn 준비 X");
    }
  });

  socket.on("r2ShowIsPlayerLived", async (isKilled) => {
    console.log("r2ShowIsPlayerLived 수신");
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    const gameOver = await whoWins(roomId);
    let isDone = false;

    try {
      const { total_user_count } = await getUserCountInRoom(roomId);
      await setStatus(userId, { r2ShowIsPlayerLived: true });
      isDone = await getStatus(roomId, "r2ShowIsPlayerLived", total_user_count);
      if (isKilled) {
        await updateUserInRoom(roomId);
      }
    } catch (error) {
      console.log("[r2ShowIsPlayerLivedError]");
      socket.emit("r2ShowIsPlayerLivedError");
    }

    if (isDone && gameOver.isValid) {
      // await showWhoWins(gameOver); //NOTE - 테스트 용이라 주석처리 함
      console.log("테스트 끝 isDone : true");
    } else if (isDone && !gameOver.isValid) {
      console.log("1 라운드 다시 시작");
      // r1MorningStart(roomId); //NOTE - 테스트 용이라 주석처리 함
    } else {
      console.log("r2ShowIsPlayerLived 준비X");
    }
  });

  socket.on("disconnect", async () => {
    console.log("클라이언트와의 연결이 끊겼습니다.");
    // try {
    //   const roomId = socket.data.roomId;
    //   const userId = socket.data.userId;
    //   const gameOver = await whoWins(roomId);

    //   await exitRoom(roomId, userId); //NOTE - 테스트 중이라서 주석 처리
    //   await updateUserInRoom(mafiaIo, roomId); //NOTE - 테스트 중이라서 주석 처리

    //   if (gameOver.isValid) {
    //     showWhoWins(gameOver); //NOTE - 테스트 중이라서 주석 처리
    //   }
    // } catch (error) {
    //   console.log("방에서 나가기에 실패했습니다.");
    // }
  });
});

httpServer.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});

const canGameStart = async (roomId) => {
  console.log("게임 진행 가능 확인");
  let canStart = false;
  try {
    const { total_user_count: totalUserCount } = await getUserCountInRoom(
      roomId
    );
    console.log("총 인원 :", totalUserCount);
    console.log("룸 아이디", roomId);

    const isAllPlayerEnoughCount = await checkPlayerCountEnough(
      roomId,
      totalUserCount
    ); //NOTE - 플레이어들이 방 정원을 채웠는지
    const isAllPlayersReady = await checkAllPlayersReady(
      roomId,
      totalUserCount
    ); //NOTE - 플레이어들이 전부 레디했는지
    canStart = isAllPlayerEnoughCount && isAllPlayersReady;
    console.log(
      "인원 충분 :",
      isAllPlayerEnoughCount,
      " 전부 레디 :" + isAllPlayersReady
    );
  } catch (error) {
    console.log("[canGameStartError]");
    mafiaIo.to(roomId).emit("canGameStartError");
  }

  if (canStart) {
    play(roomId);
  } else {
    console.log("게임 준비X");
  }
};

const play = async (roomId) => {
  console.log("게임 시작");
  // await resetRoundR0(roomId); //NOTE - 테스트에 불필요해서 주석처리
  // await resetRoundR1(roomId); //NOTE - 테스트에 불필요해서 주석처리
  // await resetRoundR2(roomId); //NOTE - 테스트에 불필요해서 주석처리
  // await resetPlayerStatus(roomId); //NOTE - 테스트에 불필요해서 주석처리
  r0NightStart(roomId);
};

const r0NightStart = (roomId) => {
  console.log("r0NightStart 송신");
  mafiaIo.to(roomId).emit("r0NightStart");
};

const r0TurnAllUserCameraMikeOff = async (roomId) => {
  console.log("r0TurnAllUserCameraMikeOff 송신");
  console.log("모든 유저 카메라, 마이크 끔");

  mafiaIo.to(roomId).emit("r0TurnAllUserCameraMikeOff");
};

const r0SetAllUserRole = (roomId) => {
  console.log("r0SetAllUserRole 송신");
  mafiaIo.to(roomId).emit("r0SetAllUserRole");
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

  mafiaPlayers = await getPlayerByRole(roomId, "마피아");

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
  } else {
    role["의사"] = null;
  }

  if (policePlayer) {
    role["경찰"] = policePlayer;
  } else {
    role["경찰"] = null;
  }

  role["시민"] = citizenPlayers;

  mafiaIo.to(roomId).emit("r0ShowAllUserRole", role);
};

const r0ShowMafiaUserEachOther = (roomId) => {
  console.log("r0ShowMafiaUserEachOther 송신");
  mafiaIo.to(roomId).emit("r0ShowMafiaUserEachOther");
};

const r0TurnMafiaUserCameraOn = async (roomId) => {
  console.log("r0TurnMafiaUserCameraOn 송신");
  let mafiaPlayers = await getPlayerByRole(roomId, "마피아");

  //NOTE - 마피아 플레이어들 화면의 마피아 플레이어 화상 카메라 켬
  console.log("마피아 플레이어들의 카메라 켬");

  mafiaIo.to(roomId).emit("r0TurnMafiaUserCameraOn", mafiaPlayers);
};

const r0TurnMafiaUserCameraOff = async (roomId) => {
  console.log("r0TurnMafiaUserCameraOff 송신");
  let mafiaPlayers = await getPlayerByRole(roomId, "마피아");

  //NOTE - 마피아 유저들 화면의 마피아 플레이어 화상 카메라 끔
  console.log("마피아 플레이어들의 카메라 끔");

  mafiaIo.to(roomId).emit("r0TurnMafiaUserCameraOff", mafiaPlayers);
};

const r1MorningStart = (roomId) => {
  console.log("r1MorningStart 송신");
  mafiaIo.to(roomId).emit("r1MorningStart");
};

const r1TurnAllUserCameraMikeOn = async (roomId) => {
  console.log("r1TurnAllUserCameraMikeOn 송신");

  console.log("모든 플레이어들 카메라와 마이크 켬");

  mafiaIo.to(roomId).emit("r1TurnAllUserCameraMikeOn");
};

const r1FindMafia = (roomId) => {
  console.log("r1FindMafia 송신");
  mafiaIo.to(roomId).emit("r1FindMafia");
};

const r1MeetingOver = (roomId) => {
  console.log("r1MetingOver 수신");
  console.log("토론이 끝났습니다.");

  mafiaIo.to(roomId).emit("r1MeetingOver");
};

const r1VoteToMafia = (roomId) => {
  console.log("r1VoteToMafia 송신");
  console.log("마피아일 것 같은 사람의 화면을 클릭해주세요.");
  mafiaIo.to(roomId).emit("r1VoteToMafia");
};

const r1ShowVoteToResult = async (roomId) => {
  console.log("r1ShowVoteToResult 송신");
  console.log("투표 개표");
  const voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  //await resetVote(roomId); //NOTE - 플레이어들이 한 투표 기록 리셋, 테스트용으로 잠시 주석처리

  console.log("투표 결과 전송");
  showVoteToResult(mafiaIo, roomId, "r1ShowVoteToResult", voteBoard);
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
        `${mostVoteResult.result.user_nickname}님이 마피아로 지목되었습니다.`,
        true
      );
  } else {
    mafiaIo
      .to(roomId)
      .emit("r1ShowMostVotedPlayer", "투표가 유효하지 않습니다.", false);
  }
};

const r1LastTalk = async (roomId) => {
  console.log("r1LastTalk 송신");
  const voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  const mostVoteResult = getMostVotedPlayer(voteBoard); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)
  console.log(
    `${mostVoteResult.result.user_nickname}님은 최후의 변론을 시작하세요.`
  );

  mafiaIo
    .to(roomId)
    .emit(
      "r1LastTalk",
      `${mostVoteResult.result.user_nickname}님은 최후의 변론을 시작하세요.`
    );
};

const r1VoteYesOrNo = (roomId) => {
  console.log("r1VoteYesOrNo 송신");
  console.log("찬성/반대 투표를 해주세요.");
  mafiaIo.to(roomId).emit("r1VoteYesOrNo", "찬성/반대 투표를 해주세요.");
};

const r1ShowVoteYesOrNoResult = async (roomId) => {
  console.log("r1ShowVoteYesOrNoResult 송신");
  console.log("투표 결과 나옴");
  const yesOrNoVoteResult = await getYesOrNoVoteResult(roomId); //NOTE - 찬반 투표 결과 (확정X, 동률 나올 수 있음)

  showVoteYesOrNoResult(
    mafiaIo,
    roomId,
    "r1ShowVoteYesOrNoResult",
    yesOrNoVoteResult.detail
  ); //NOTE - 투표 결과를 방의 유저들에게 보여줌
  // await resetVote(roomId); //NOTE - 투표 결과 리셋, 테스트 상 주석처리
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
    await updateUserInRoom(mafiaIo, roomId);

    //NOTE - 죽은 플레이어가 마피아인지 시민인지 알림
    if (isPlayerMafia) {
      console.log("마피아가 죽었습니다.");
      mafiaIo
        .to(roomId)
        .emit("r1KillMostVotedPlayer", "마피아가 죽었습니다.", killedPlayer);
    } else {
      console.log("시민이 죽었습니다.");
      mafiaIo
        .to(roomId)
        .emit("r1KillMostVotedPlayer", "시민이 죽었습니다.", killedPlayer);
    }
  } else {
    //NOTE - 투표 실패, 동률이 나옴
    console.log("동률 나옴");
    mafiaIo
      .to(roomId)
      .emit("r1KillMostVotedPlayer", "동률이 나왔습니다.", null);
  }
};

const r1TurnAllUserCameraMikeOff = async (roomId) => {
  console.log("r1TurnAllUserCameraMikeOff 송신");

  console.log("모든 플레이어의 카메라와 마이크 끔");
  mafiaIo.to(roomId).emit("r1TurnAllUserCameraMikeOff");
};

const r1DecideMafiaToKillPlayer = (roomId) => {
  console.log("r1DecideMafiaToKillPlayer 송신");

  console.log("마피아는 누구를 죽일지 결정해주세요.");
  mafiaIo.to(roomId).emit("r1DecideMafiaToKillPlayer");
};

const r1TurnMafiaUserCameraOn = async (roomId) => {
  console.log("r1TurnMafiaUserCameraOn 송신");
  const mafiaPlayers = await getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  console.log("마피아 유저들의 카메라 켬");
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
      "누구를 죽일지 제스처를 통해 상의하세요."
    );
};

const r1TurnMafiaUserCameraOff = async (roomId) => {
  console.log("r1TurnMafiaUserCameraOff 송신");

  console.log("마피아 유저들의 카메라 끔");
  const mafiaPlayers = await getPlayerByRole(roomId, "마피아");
  mafiaIo.to(roomId).emit("r1TurnMafiaUserCameraOff", mafiaPlayers);
};

const r1DecideDoctorToSavePlayer = async (roomId) => {
  console.log("r1DecideDoctorToSavePlayer 송신");

  console.log("의사 역할이 방에 있다면 실행");
  const { total_user_count: totalUserCount } = await getUserCountInRoom(roomId);
  const maxDoctorCount = await getRoleMaxCount(totalUserCount, "doctor_count");
  const doctorPlayer = await getPlayerByRole(roomId, "의사");

  if (maxDoctorCount !== 0) {
    mafiaIo
      .to(roomId)
      .emit(
        "r1DecideDoctorToSavePlayer",
        "의사는 누구를 살릴 지 결정하세요.",
        true,
        doctorPlayer
      );
  } else {
    mafiaIo
      .to(roomId)
      .emit("r1DecideDoctorToSavePlayer", "의사 없음", false, null);
  }
};

const r1DecidePoliceToDoubtPlayer = async (roomId) => {
  console.log("r1DecidePoliceToDoubtPlayer 송신");

  console.log("경찰역할이 방에 있다면 실행");
  const { total_user_count: totalUserCount } = await getUserCountInRoom(roomId);
  const maxPoliceCount = await getRoleMaxCount(totalUserCount, "police_count");
  const policePlayer = await getPlayerByRole(roomId, "경찰");

  if (maxPoliceCount !== 0) {
    mafiaIo
      .to(roomId)
      .emit(
        "r1DecidePoliceToDoubtPlayer",
        "경찰은 마피아 의심자를 결정해주세요.",
        true,
        policePlayer
      );
  } else {
    mafiaIo
      .to(roomId)
      .emit("r1DecidePoliceToDoubtPlayer", "경찰이 없습니다.", false, null);
  }
};

const r1ShowDoubtedPlayer = async (roomId) => {
  console.log("r1ShowDoubtedPlayer 송신");

  const policePlayer = await getPlayerByRole(roomId, "경찰");

  console.log("경찰이 살아있다면 실행");
  if (policePlayer) {
    const playerDoubted = await checkChosenPlayer(roomId, "경찰");
    const isPlayerMafia = await checkPlayerMafia(playerDoubted);

    if (isPlayerMafia === true) {
      console.log("해당 플레이어는 마피아가 맞습니다.");
      mafiaIo.to(roomId),
        emit(
          "r1ShowDoubtedPlayer",
          "해당 플레이어는 마피아가 맞습니다.",
          true,
          policePlayer
        );
    } else if (isPlayerMafia === false) {
      console.log("해당 플레이어는 마피아가 아닙니다.");
      mafiaIo
        .to(roomId)
        .emit(
          "r1ShowDoubtedPlayer",
          "해당 플레이어는 마피아가 아닙니다.",
          true,
          policePlayer
        );
    } else {
      console.log("경찰이 지목하지 않았습니다.");
      mafiaIo
        .to(roomId)
        .emit(
          "r1ShowDoubtedPlayer",
          "경찰이 지목하지 않았습니다.",
          null,
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
        null
      );
  }
};

const r1KillPlayerByRole = async (roomId) => {
  console.log("r1KillPlayerByRole 송신");
  const mafiaPlayers = await getPlayerByRole(roomId, "마피아");
  const doctorPlayer = await getPlayerByRole(roomId, "의사");
  const playerToKill = await checkChosenPlayer(roomId, "마피아");
  const playerToSave = await checkChosenPlayer(roomId, "의사");

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
  mafiaIo.to(roomId).emit("r2MorningStart");
};

const r2TurnAllUserCameraMikeOn = async (roomId) => {
  console.log("r2TurnAllUserCameraMikeOn 송신");

  console.log("모든 플레이어의 카메라와 마이크 켬");
  mafiaIo.to(roomId).emit("r2TurnAllUserCameraMikeOn");
};

const r2ShowIsPlayerLived = async (roomId) => {
  console.log("r2ShowIsPlayerLived 송신");
  const playerToKill = await checkChosenPlayer(roomId, "마피아");
  const isPlayerLived = await checkPlayerLived(playerToKill);

  if (isPlayerLived) {
    console.log("의사의 활약으로 아무도 죽지 않았습니다.");
    mafiaIo
      .to(roomId)
      .emit(
        "r2ShowIsPlayerLived",
        "의사의 활약으로 아무도 죽지 않았습니다.",
        true,
        playerToKill
      );
  } else {
    const killedPlayerNickname = await getPlayerNickname(playerToKill);
    console.log(`${killedPlayerNickname}님이 죽었습니다.`);
    mafiaIo
      .to(roomId)
      .emit(
        "r2ShowIsPlayerLived",
        `${killedPlayerNickname}님이 죽었습니다.`,
        false,
        playerToKill
      );
  }
};
