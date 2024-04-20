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
} from "./api/supabse/roomAPI.js";
import {
  checkAllPlayersReady,
  checkPlayerCountEnough,
  choosePlayer,
  getPlayerByRole,
  getRoleMaxCount,
  getStatus,
  setPlayerRole,
  setReady,
  voteTo,
  voteYesOrNo,
} from "./api/supabse/gamePlayAPI.js";
import { Moderator } from "./mafia-algorithm/class/moderatorClass.js";
import {
  openPlayerRole,
  showModal,
  shufflePlayers,
  turnOffCamera,
  turnOffMike,
  turnOnCamera,
  turnOnMike,
} from "./api/supabse/socket/moderatorAPI.js";

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
  socket.join("11111111-f1b4-46eb-a187-2da752eed29c");
  // playMafia("12dc28ad-4764-460f-9a54-58c31fdacd1f", 5); //NOTE - 테스트 코드
  socket.on("start", () => {
    console.log("client : start");
    mafiaIo.emit("go", "hello", 5000);
  });
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
      console.log("다음거 실행");
    } else {
      console.log("r1FindMafia 준비 X");
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

  //NOTE - 마피아 인원 수만큼 플레이어들에게 마피아 역할 배정
  console.log("마피아 역할 배정");
  for (let playerIndex = 0; playerIndex < maxMafiaCount; playerIndex++) {
    await setPlayerRole(allPlayers[playerIndex], "마피아");
  }

  mafiaPlayers = await getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들에게 자신이 마피아인 것을 알리고 마피아인 유저가 누구인지 공개
  console.log("마피아 역할 공개");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((roleUserId) =>
      openPlayerRole(mafiaIo, clientUserId, roleUserId, "마피아")
    )
  );

  console.log("방에 의사가 있다면 실행");
  if (maxDoctorCount !== 0) {
    console.log("의사 뽑음");
    doctorPlayer = await setPlayerRole(allPlayers[maxMafiaCount], "의사");
    openPlayerRole(mafiaIo, doctorPlayer, doctorPlayer, "의사"); //NOTE - 의사 플레이어의 화면에서 자신이 의사임을 알림
  }

  console.log("경찰이 있다면 실행");
  if (maxPoliceCount !== 0) {
    console.log("경찰 뽑음");
    await setPlayerRole(allPlayers[maxMafiaCount + 1], "경찰");
  }

  policePlayer = getPlayerByRole(allPlayers[maxMafiaCount + 1], "경찰"); //NOTE - 참가자를 경찰 플레이어로 설정
  openPlayerRole(mafiaIo, policePlayer, policePlayer, "경찰"); //NOTE - 경찰 플레이어의 화면에서 자신이 경찰임을 알림

  citizenPlayers = await getPlayerByRole(roomId, "시민");

  //NOTE - 시민 플레이어의 화면에서 자신이 시민임을 알림
  console.log("시민들 각자 역할 공개");
  citizenPlayers.forEach((clientUserId) =>
    openPlayerRole(mafiaIo, clientUserId, clientUserId, "시민")
  );

  console.log("r0ShowAllUserRole 송신");
  mafiaIo.to(roomId).emit("r0ShowAllUserRole");
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

// const showModal = (roomName, title, message, timer, nickname, yesOrNo) => {
//   mafiaIo.emit("showModal", title, message, timer, nickname, yesOrNo); //NOTE - 테스트 코드라서 .to(roomName) 제외
// };

// const setCamera = (roomName, cameraUserId, isOn) => {
//   mafiaIo.emit("setCamera", cameraUserId, isOn); //NOTE - 테스트 코드라서 .to(roomName) 제외
// };

// const setMike = (roomName, mikeUserId, isOn) => {
//   mafiaIo.emit("setMike", mikeUserId, isOn); //NOTE - 테스트 코드라서 .to(roomName) 제외
// };

// const openPlayerRole = (roomName, userId, role) => {
//   mafiaIo.emit("openPlayerRole", userId, role); //NOTE - 테스트 코드라서 .to(roomName) 제외
// };

// const showVoteYesOrNoResult = (roomName, voteResult) => {
//   mafiaIo.emit("showVoteYesOrNoResult", voteResult); //NOTE - 테스트 코드라서 .to(roomName) 제외
// };

// const showVoteToResult = (roomName, voteResult) => {
//   mafiaIo.emit("showVoteToResult", voteResult); //NOTE - 테스트 코드라서 .to(roomName) 제외
// };

const playMafia = async (roomId, totalUserCount) => {
  //NOTE - roomId : 12dc28ad-4764-460f-9a54-58c31fdacd1f

  //NOTE - 현재 방의 마피아 최대 인원 수
  let maxMafiaCount;

  //NOTE - 현재 방의 의사 최대 인원 수
  let maxDoctorCount;

  //NOTE - 현재 방의 경찰 최대 인원 수
  let maxPoliceCount;

  //NOTE - 현재 방의 시민 최대 인원 수
  let maxCitizenCount;

  //NOTE - 랜덤으로 지정된 플레이어
  let randomPlayer;

  //NOTE - 역할이 마피아인 플레이어 목록
  let mafiaPlayers;

  //NOTE - 역할이 의사인 플레이어
  let doctorPlayer;

  //NOTE - 역할이 경찰인 플레이어
  let policePlayer;

  //NOTE - 역할이 시민인 플레이어 목록
  let citizenPlayers;

  //NOTE - 방안의 모든 플레이어들의 아이디 목록
  let allPlayers;

  //NOTE - 죽은 플레이아
  let killedPlayer;

  //NOTE - 죽은 펠리어어의 닉네임
  let killedPlayerNickname;

  //NOTE - 죽기로 결정된 플레이어
  let playerToKill;

  //NOTE - 살리기로 결정된 플레이어
  let playerToSave;

  //NOTE - 경찰이 조사한 플레이어가 마피아인지 여부
  let isPlayerMafia;

  //NOTE - 플레이어의 생사 여부
  let isPlayerLived;

  //NOTE - 방을 나갈지 선택
  let choiceToExit;

  console.log("마피아 시작");

  const moderator = new Moderator(totalUserCount, mafiaIo, roomId); //NOTE - 사회자 생성

  maxMafiaCount = moderator.roomComposition.mafiaCount;
  maxDoctorCount = moderator.roomComposition.doctorCount;
  maxPoliceCount = moderator.roomComposition.policeCount;
  maxCitizenCount = moderator.roomComposition.citizenCount;

  let startTime = Date.now();

  while (true) {
    let canStart = false;
    let intervalTime = 500;
    let passedTime = 0;

    passedTime = Date.now() - startTime;
    if (passedTime > intervalTime) {
      startTime = Date.now();
      const isAllPlayerEnoughCount = await moderator.checkPlayerCountEnough(
        roomId,
        totalUserCount
      ); //NOTE - 플레이어들이 방 정원을 채웠는지
      const isAllPlayersReady = await moderator.checkAllPlayersReady(
        roomId,
        totalUserCount
      ); //NOTE - 플레이어들이 전부 레디했는지
      console.log("게임 레디 확인");
      canStart = moderator.canGameStart(
        isAllPlayerEnoughCount,
        isAllPlayersReady
      );
      if (canStart) {
        break;
      }
    }
  }

  console.log("게임 시작"); //NOTE - 테스트 코드

  allPlayers = await moderator.getAllUserId(roomId);

  console.log("라운드 시작"); //NOTE - 테스트 코드

  //SECTION - [UI(모든 유저) : 밤이 되었습니다.] : r0NightStart
  console.log("밤 시작"); //NOTE - 테스트 코드
  moderator.showModal(roomId, "제목", "밤 시작", 500, "닉네임", true);

  //SECTION - 모든 유저의 화면과 마이크 끔 : r0TurnAllUserCameraMikeOff
  //NOTE - 모든 플레이어들의 카메라와 마이크 끔
  console.log("카메라, 마이크 끔");
  allPlayers.forEach((player) => {
    moderator.turnOffCamera(roomId, player);
    moderator.turnOffMike(roomId, player);
  });

  //SECTION - [UI(모든 유저) : 역할배정을 시작하겠습니다.] : r0SetAllUserRole
  //NOTE - 모든 유저들 작업
  console.log("역할 배정을 시작하겠습니다.");
  moderator.showModal(
    roomId,
    "제목",
    "역할 배정을 시작하겠습니다.",
    500,
    "닉네임",
    true
  );

  //SECTION - 시스템이 마피아 1~3명, 경찰, 의사, 시민들 선택 카드 노출(랜덤) : r0ShowAllUserRole
  //NOTE - 플레이어들을 무작위로 섞음
  allPlayers = moderator.shufflePlayers(allPlayers);

  //NOTE - 마피아 인원 수만큼 플레이어들에게 마피아 역할 배정
  console.log("마피아 역할 배정");
  for (let playerIndex = 0; playerIndex < maxMafiaCount; playerIndex++) {
    await moderator.setPlayerRole(allPlayers[playerIndex], "마피아");
  }

  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들에게 자신이 마피아인 것을 알리고 마피아인 유저가 누구인지 공개
  console.log("마피아 역할 공개");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((roleUserId) =>
      moderator.openPlayerRole(clientUserId, roleUserId, "마피아")
    )
  );

  console.log("방에 의사가 있다면 실행");
  if (maxDoctorCount !== 0) {
    console.log("의사 뽑음");
    doctorPlayer = await moderator.setPlayerRole(
      allPlayers[maxMafiaCount],
      "의사"
    );
    moderator.openPlayerRole(doctorPlayer, doctorPlayer, "의사"); //NOTE - 의사 플레이어의 화면에서 자신이 의사임을 알림
  }

  console.log("경찰이 있다면 실행");
  console.log("경찰 뽑음");
  await moderator.setPlayerRole(allPlayers[maxMafiaCount + 1], "경찰");

  policePlayer = moderator.getPlayerByRole(
    allPlayers[maxMafiaCount + 1],
    "경찰"
  ); //NOTE - 참가자를 경찰 플레이어로 설정
  moderator.openPlayerRole(policePlayer, policePlayer, "경찰"); //NOTE - 경찰 플레이어의 화면에서 자신이 경찰임을 알림

  citizenPlayers = await moderator.getPlayerByRole(roomId, "시민");

  //NOTE - 시민 플레이어의 화면에서 자신이 시민임을 알림
  console.log("시민들 각자 역할 공개");
  citizenPlayers.forEach((clientUserId) =>
    moderator.openPlayerRole(clientUserId, clientUserId, "시민")
  );

  //SECTION - [UI(모든 유저) : 마피아들은 고개를 들어 서로를 확인해 주세요.] : r0ShowMafiaUserEachOther
  console.log("마피아들은 고개를 들어 서로를 확인해 주세요.");
  moderator.showModal(
    roomId,
    "제목",
    "마피아들은 고개를 들어 서로를 확인해 주세요.",
    500,
    "닉네임",
    true
  );

  //SECTION - 마피아 유저들의 컴퓨터에는 마피아 유저들의 카메라 켜졌다 꺼짐 : r0TurnMafiaUserCameraOn
  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 켬
  console.log("마피아 유저들의 카메라, 마이크 켬");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((playerUserId) => {
      moderator.turnOnCamera(clientUserId, playerUserId);
      moderator.turnOnMike(clientUserId, playerUserId);
    })
  );

  moderator.waitForMs(500); //NOTE - 시간 재기
  //SECTION - r0TurnMafiaUserCameraOff
  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 끔
  console.log("마피아 유저들의 카메라, 마이크 끔");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((playerUserId) => {
      moderator.turnOffCamera(clientUserId, playerUserId);
      moderator.turnOffMike(clientUserId, playerUserId);
    })
  );
  //SECTION - [UI : 아침이 되었습니다.] : r1MorningStart
  console.log("아침이 시작되었습니다.");
  moderator.showModal(
    roomId,
    "제목",
    "아침이 시작되었습니다.",
    500,
    "닉네임",
    false
  );

  //SECTION - 모든 유저 카메라 및 마이크 켬 : r1TurnAllUserCameraMikeOn
  //NOTE - 모든 플레이어들의 카메라와 마이크 켬
  console.log("카메라, 마이크 켬");
  allPlayers.forEach((player) => {
    moderator.turnOnCamera(roomId, player);
    moderator.turnOnMike(roomId, player);
  });

  //SECTION - [UI(모든 유저) : 모든 유저는 토론을 통해 마피아를 찾아내세요.] : r1FindMafia
  console.log("모든 유저는 토론을 통해 마피아를 찾아내세요.");
  moderator.showModal(
    roomId,
    "제목",
    "모든 유저는 토론을 통해 마피아를 찾아내세요.",
    500,
    "닉네임",
    false
  );

  moderator.waitForMs(500);

  //SECTION - [UI(모든 유저) : 토론이 끝났습니다.] : r1MeetingOver
  console.log("토론이 끝났습니다.");
  moderator.showModal(
    roomId,
    "제목",
    "토론이 끝났습니다.",
    500,
    "닉네임",
    false
  );

  //SECTION - [UI(모든 유저) : 마피아일 것 같은 사람의 화면을 클릭하세요] : r1VoteToMafia
  console.log("마피아일 것 같은 사람의 화면을 클릭해주세요.");
  moderator.showModal(
    roomId,
    "제목",
    "마피아일 것 같은 사람의 화면을 클릭해주세요.",
    500,
    "닉네임",
    false
  );

  //NOTE - 예시
  /*
    moderator.players[0].voteToPlayer(moderator.players[1]); //NOTE - 0번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
    moderator.players[1].voteToPlayer(moderator.players[2]); //NOTE - 1번 인덱스 플레이어가 2번 인덱스 플레이어에게 투표
    moderator.players[2].voteToPlayer(moderator.players[1]); //NOTE - 2번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
    moderator.players[3].voteToPlayer(moderator.players[1]); //NOTE - 3번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
    moderator.players[4].voteToPlayer(moderator.players[1]); //NOTE - 4번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
    moderator.players[5].voteToPlayer(moderator.players[1]); //NOTE - 5번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
    moderator.players[6].voteToPlayer(moderator.players[2]); //NOTE - 6번 인덱스 플레이어가 2번 인덱스 플레이어에게 투표
    moderator.players[7].voteToPlayer(moderator.players[1]); //NOTE - 7번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  */

  moderator.waitForMs(500); //NOTE - 시간 재기
  //SECTION - [UI(모든 유저) : A : 10표, B : 2표 ....  가장 많은 투표를 받은 A가 마피아로 지목되었습니다.(이미지)] : r1ShowVoteToResult
  console.log("투표 개표");
  const voteBoard = await moderator.getPlayersVoteResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  const mostVoteResult = moderator.getMostVotedPlayer(voteBoard); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)
  //await moderator.resetVote(roomId); //NOTE - 플레이어들이 한 투표 기록 리셋, 테스트용으로 잠시 주석처리

  console.log("투표 결과 전송");
  moderator.showVoteToResult(roomId, voteBoard);
  if (mostVoteResult.isValid) {
    console.log("투표 성공");
    //NOTE - 투표 성공

    console.log(
      `${mostVoteResult.result.user_nickname}님이 마피아로 지목되었습니다.`
    );
    moderator.showModal(
      roomId,
      "제목",
      `${mostVoteResult.result.user_nickname}님이 마피아로 지목되었습니다.`,
      500,
      "닉네임",
      false
    );

    //SECTION - [UI(모든 유저) : A는 최후의 변론을 시작하세요.] : r1LastTalk
    console.log(
      `${mostVoteResult.result.user_nickname}님은 최후의 변론을 시작하세요.`
    );
    moderator.showModal(
      roomId,
      "제목",
      `${mostVoteResult.result.user_nickname}님은 최후의 변론을 시작하세요.`,
      500,
      "닉네임",
      false
    );

    moderator.waitForMs(500); //NOTE - 시간 재기

    //SECTION - [UI(모든 유저) : 찬성/반대 투표를 해주세요.] : r1VoteYesOrNo
    console.log("찬성/반대 투표를 해주세요.");
    moderator.showModal(
      roomId,
      "제목",
      "찬성/반대 투표를 해주세요.",
      500,
      "닉네임",
      false
    );

    moderator.waitForMs(500); //NOTE - 시간 재기

    //NOTE - 여기부터

    //NOTE - 예시
    /*
      moderator.players[0].voteYesOrNo(votes, false); //NOTE - 0번 인덱스 플레이어가 찬성에 투표
      moderator.players[1].voteYesOrNo(votes, true); //NOTE - 1번 인덱스 플레이어가 찬성에 투표
      moderator.players[2].voteYesOrNo(votes, true); //NOTE - 2번 인덱스 플레이어가 찬성에 투표
      moderator.players[3].voteYesOrNo(votes, false); //NOTE - 3번 인덱스 플레이어가 반대에 투표
      moderator.players[4].voteYesOrNo(votes, false); //NOTE - 4번 인덱스 플레이어가 반대에 투표
      moderator.players[5].voteYesOrNo(votes, false); //NOTE - 5번 인덱스 플레이어가 찬성에 투표
      moderator.players[6].voteYesOrNo(votes, true); //NOTE - 6번 인덱스 플레이어가 찬성에 투표
      moderator.players[7].voteYesOrNo(votes, true); //NOTE - 7번 인덱스 플레이어가 찬성에 투표
  */

    //SECTION - [UI(모든 유저) : 찬성/반대 결과와 찬성 몇 표, 반대 몇 표(이미지)] : r1ShowVoteYesOrNoResult
    console.log("트표 결과 나옴");
    const yesOrNoVoteResult = await moderator.getYesOrNoVoteResult(roomId); //NOTE - 찬반 투표 결과 (확정X, 동률 나올 수 있음)
    moderator.showVoteYesOrNoResult(roomId, yesOrNoVoteResult.detail); //NOTE - 투표 결과를 방의 유저들에게 보여줌

    // await moderator.resetVote(roomId); //NOTE - 투표 결과 리셋, 테스트 상 주석

    //SECTION - O가 과반수 넘을 시 : 지목된 시민 사망 : r1KillMostVotedPlayer
    //NOTE - 투표 결과가 유효하고(동률이 아님), 찬성이 반대보다 많은 경우
    if (yesOrNoVoteResult.isValid && yesOrNoVoteResult.result) {
      console.log("투표 결과 죽일 플레이어 나옴");
      killedPlayer = await moderator.killPlayer(mostVoteResult.result.user_id); //NOTE - 투표를 가장 많이 받은 플레이어 사망

      mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아");
      doctorPlayer = await moderator.getPlayerByRole(roomId, "의사");
      policePlayer = await moderator.getPlayerByRole(roomId, "경찰");
      citizenPlayers = await moderator.getPlayerByRole(roomId, "시민");

      isPlayerMafia = await moderator.checkPlayerMafia(killedPlayer); //NOTE - 죽은 플레이어가 마피아인지 확인

      //SECTION - A가 시민(마피아)이라면 : [UI(모든 유저) : 시민(마피아)이 죽었습니다.] : r1ShowIsPlayerMafia
      //NOTE - 죽은 플레이어가 마피아인지 시민인지 알림
      if (isPlayerMafia) {
        console.log("마피아가 죽었습니다.");
        moderator.showModal(
          roomId,
          "제목",
          "마피아가 죽었습니다.",
          500,
          "닉네임",
          false
        );

        moderator.openPlayerRole(roomId, killedPlayer, "마피아");
      } else {
        console.log("시민이 죽었습니다.");
        moderator.showModal(
          roomId,
          "제목",
          "시민이 죽었습니다.",
          500,
          "닉네임",
          false
        );

        moderator.openPlayerRole(roomId, killedPlayer, "시민");
      }
    } else {
      //NOTE - 투표 실패, 동률이 나옴
      console.log("동률 나옴");
    }
  }

  //SECTION - [UI(모든 유저) : 밤이 되었습니다] : r1NightStart
  console.log("밤이 시작되었습니다.");
  moderator.showModal(
    roomId,
    "제목",
    "밤이 시작되었습니다.",
    500,
    "닉네임",
    false
  );

  //SECTION - 모든 유저의 카메라와 마이크 끔 : r1TurnAllUserCameraMikeOff
  //NOTE - 모든 플레이어들의 카메라와 마이크 끔
  console.log("카메라, 마이크 끔");
  allPlayers.forEach((player) => {
    moderator.turnOffCamera(roomId, player);
    moderator.turnOffMike(roomId, player);
  });

  //SECTION - [UI(모든 유저) : 마피아는 누굴 죽일지 결정해주세요.] : r1DecideMafiaToKillPlayer
  console.log("마피아는 누구를 죽일지 결정해주세요.");
  moderator.showModal(
    roomId,
    "제목",
    "마피아는 누구를 죽일지 결정해주세요.",
    500,
    "닉네임",
    false
  );

  //SECTION - 마피아 유저 컴퓨터에서 마피아인 유저의 카메라 켬 : r1TurnMafiaUserCameraOn
  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라 켬
  console.log("마피아 유저들의 카메라켬");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((playerUserId) => {
      moderator.turnOnCamera(clientUserId, playerUserId);
    })
  );

  //SECTION - [UI(마피아 유저) : 마피아는 제스처를 통해 상의 후 누구를 죽일 지 선택해주세요] : r1GestureToMafiaEachOther
  console.log("누구를 죽일지 제스처를 통해 상의하세요.");
  mafiaPlayers.forEach((mafiaUserId) => {
    moderator.showModal(
      mafiaUserId,
      "제목",
      "누구를 죽일지 제스처를 통해 상의하세요.",
      0,
      "닉네임",
      false
    );
  });

  moderator.waitForMs(500);
  console.log("마피아가 누구를 죽일지 지목");
  playerToKill = await moderator.checkChosenPlayer(roomId, "마피아"); //NOTE - 가장 먼저 선택한 마피아의 지시를 따름, 죽일 플레이어 결정

  //SECTION - 마피아 유저의 카메라 끔 : r1TurnMafiaUserCameraOff
  //NOTE - 마피아 유저들 화면의 마피아 유저 카메라 끔
  console.log("마피아 유저들의 카메라 끔");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((playerUserId) => {
      moderator.turnOffCamera(clientUserId, playerUserId);
    })
  );

  //SECTION - [UI(모든 유저) : 의사는 누구를 살릴 지 결정해주세요.] : r1DecideDoctorToSavePlayer
  //NOTE - 방 구성인원 중 의사가 있을 경우
  console.log("의사 역할이 방에 있다면 실행");
  if (moderator.maxDoctorCount !== 0) {
    moderator.showModal(
      roomId,
      "제목",
      "의사는 누구를 살릴 지 결정하세요.",
      500,
      "닉네임",
      false
    );

    //NOTE - 의사가 살아있을 경우
    doctorPlayer = await moderator.getPlayerByRole(roomId, "의사");
    console.log("의사가 살아있다면 실행");
    if (doctorPlayer) {
      moderator.waitForMs(500); //NOTE - 시간 재기

      playerToSave = await moderator.checkChosenPlayer(roomId, "의사"); //NOTE - 의사가 살릴 플레이어를 선택
    }
  }

  //SECTION - [UI(모든 유저) : 경찰은 마피아 의심자를 결정해주세요.] : r1DecidePoliceToDoubtPlayer
  //NOTE - 방 구성인원 중 경찰 있을 경우
  console.log("경찰역할이 방에 있다면 실행");
  if (moderator.maxPoliceCount !== 0) {
    moderator.showModal(
      roomId,
      "제목",
      "경찰은 마피아 의심자를 결정해주세요.",
      500,
      "닉네임",
      false
    );

    //SECTION - 마피아가 맞을(아닐) 시 - [UI(경찰 유저) : O(X)] : r1ShowDoubtedPlayer
    //NOTE - 경찰이 살아있을 경우
    policePlayer = await moderator.getPlayerByRole(roomId, "경찰");
    console.log("경찰이 살아있다면 실행");
    if (policePlayer) {
      const playerDoubted = await moderator.checkChosenPlayer(roomId, "경찰"); //NOTE - 0번 인덱스 플레이어가 마피아인지 의심
      isPlayerMafia = await moderator.checkPlayerMafia(playerDoubted);

      if (isPlayerMafia) {
        console.log("해당 플레이어는 마피아가 맞습니다.");
        moderator.showModal(
          policePlayer,
          "제목",
          "해당 플레이어는 마피아가 맞습니다.",
          500,
          "닉네임",
          false
        );
      } else {
        console.log("해당 플레이어는 마피아가 아닙니다.");
        moderator.showModal(
          policePlayer,
          "제목",
          "해당 플레이어는 마피아가 아닙니다.",
          500,
          "닉네임",
          false
        );
      }
    }
  }

  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아");
  doctorPlayer = await moderator.getPlayerByRole(roomId, "의사");

  //NOTE - 죽일 플레이어와 살릴 플레이어 결정하고 생사 결정
  console.log("죽일 플레어와 살릴 플레이어 결정하고 생사 결정");
  if (playerToKill !== playerToSave) {
    if (mafiaPlayers) {
      await moderator.killPlayer(playerToKill);
    }

    if (doctorPlayer) {
      await moderator.savePlayer(playerToSave);
    }
  }

  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아");
  doctorPlayer = await moderator.getPlayerByRole(roomId, "의사");
  policePlayer = await moderator.getPlayerByRole(roomId, "경찰");
  citizenPlayers = await moderator.getPlayerByRole(roomId, "시민");

  //SECTION - [UI : 아침이 되었습니다.] : r2MorningStart
  console.log("아침이 시작되었습니다.");
  moderator.showModal(
    roomId,
    "제목",
    "아침이 시작되었습니다.",
    500,
    "닉네임",
    false
  );

  //SECTION - 모든 유저 화상카메라 및 마이크 켬 : r2TurnAllUserCameraMikeOn
  //NOTE - 모든 플레이어들의 카메라와 마이크 켬
  console.log("카메라, 마이크 켬");
  allPlayers.forEach((player) => {
    moderator.turnOnCamera(roomId, player);
    moderator.turnOnMike(roomId, player);
  });

  //SECTION - 의사가 살리는데 성공했는지 : r2ShowIsPlayerLived
  //NOTE - 마피아가 죽일려고한 플레이어가 살았는지 죽었는지 확인
  isPlayerLived = await moderator.checkPlayerLived(killedPlayer);

  if (isPlayerLived) {
    console.log("의사의 활약으로 아무도 죽지 않았습니다.");
    moderator.showModal(
      roomId,
      "제목",
      "의사의 활약으로 아무도 죽지 않았습니다.",
      500,
      "닉네임",
      false
    );
  } else {
    killedPlayerNickname = await moderator.getPlayerNickname(killedPlayer);
    console.log(`${killedPlayerNickname}님이 죽었습니다.`);
    moderator.showModal(
      roomId,
      "제목",
      `${killedPlayerNickname}님이 죽었습니다.`,
      500,
      "닉네임",
      false
    );
  }
  //SECTION - [UI(사망한 유저) : 게임을 관전 하시겠습니까. 나가시겠습니까] : r2AskPlayerToExit
  //FIXME - 본인이 죽었는지 확인하는 코드 추가해야 함
  console.log("게임을 관전 하시겠습니까? 나가시겠습니까?");
  moderator.showModal(
    killedPlayer,
    "제목",
    "게임을 관전 하시겠습니까? 나가시겠습니까?",
    500,
    "닉네임",
    false
  );

  choiceToExit = true; //NOTE - 나간다고 가정

  //NOTE - 방을 나갈지 관전할지
  if (choiceToExit) {
    //killedPlayer.exit(); //FIXME - 플레이어는 방을 나감, 중간에 나가는 경우에도 사용할 수 있음, 구현해야 함
  }

  //SECTION - 시민(마피아)이 이긴 경우 : [UI(모든 유저) : 시민(마피아) 승(이미지)] : r2WhoWIns
  if (moderator.whoWins.isValid) {
    //NOTE - 게임 종료 만족하는 지
    console.log(`${moderator.whoWins.result} 팀이 이겼습니다.`);
    moderator.showModal(
      roomId,
      "제목",
      `${moderator.whoWins.result} 팀이 이겼습니다.`,
      500,
      "닉네임",
      false
    );
  }
};
