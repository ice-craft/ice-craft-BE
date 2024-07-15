export const onSocket = () => {
  socket.on("start", () => {
    console.log("client : start");
    mafiaIo.emit("go", "hello", 5000);
  });

  socket.on("enterMafia", enterMafia); // 마피아 입장
  socket.on(CREATE_ROOM, createRoom);

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
      socket.emit("setReady", "레디를 설정하는데 성공했습니다.");
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

  socket.on("r1ShowMostVotedPlayer", async (roomId) => {
    console.log("r1ShowMostVotedPlayer 수신");

    const { total_user_count } = await getUserCountInRoom(roomId);
    const isDone = await getStatus(
      roomId,
      "r1ShowMostVotedPlayer",
      total_user_count
    );

    if (isDone) {
      r1LastTalk(roomId);
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
      console.log("다음 거 실행");
    } else {
      console.log("r1TurnMafiaUserCameraOn 준비 X");
    }
  });

  io.on("disconnection", () => {
    console.log("클라이언트와의 연결이 끊겼습니다.");
  });
};
