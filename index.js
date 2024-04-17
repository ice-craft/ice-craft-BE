//NOTE - 네임스페이스, 룸 구현

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  createRoom,
  exitRoom,
  fastJoinRoom,
  getRooms,
  getUserInfoInRoom,
  joinRoom,
} from "./api/supabse/roomAPI.js";
import {
  choosePlayer,
  setReady,
  voteTo,
  voteYesOrNo,
} from "./api/supabse/gamePlayAPI.js";
import { Moderator } from "./mafia-algorithm/class/moderatorClass.js";

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
  //socket.join("12dc28ad-4764-460f-9a54-58c31fdacd1f");
  playMafia("12dc28ad-4764-460f-9a54-58c31fdacd1f", 5); //NOTE - 테스트 코드
  //showModal("111", "제목", "내용", 0, "닉네임", false);
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

  socket.on("setReady", async (userId, ready) => {
    console.log(`[setReady] userId : ${userId}, ready:${ready}`);
    try {
      const result = await setReady(userId, ready);
      if (result.length === 0) {
        throw new Error();
      }
      socket.emit("setReady", "레디를 설정하는데 성공했습니다.");
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

  io.on("disconnection", () => {
    console.log("클라이언트와의 연결이 끊겼습니다.");
  });
});

httpServer.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});

const showModal = (roomName, title, message, timer, nickname, yesOrNo) => {
  mafiaIo.emit("showModal", title, message, timer, nickname, yesOrNo); //NOTE - 테스트 코드라서 .to(roomName) 제외
};

const setCamera = (roomName, cameraUserId, isOn) => {
  mafiaIo.emit("setCamera", cameraUserId, isOn); //NOTE - 테스트 코드라서 .to(roomName) 제외
};

const setMike = (roomName, mikeUserId, isOn) => {
  mafiaIo.emit("setMike", mikeUserId, isOn); //NOTE - 테스트 코드라서 .to(roomName) 제외
};

const openPlayerRole = (roomName, userId, role) => {
  mafiaIo.emit("openPlayerRole", userId, role); //NOTE - 테스트 코드라서 .to(roomName) 제외
};

const showVoteYesOrNoResult = (roomName, voteResult) => {
  mafiaIo.emit("showVoteYesOrNoResult", voteResult); //NOTE - 테스트 코드라서 .to(roomName) 제외
};

const showVoteToResult = (roomName, voteResult) => {
  mafiaIo.emit("showVoteToResult", voteResult); //NOTE - 테스트 코드라서 .to(roomName) 제외
};

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

  const moderator = new Moderator(totalUserCount, mafiaIo); //NOTE - 사회자 생성

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
  moderator.showModal(roomId, "제목", "라운드 시작", 500, "닉네임", true);

  console.log("밤 시작"); //NOTE - 테스트 코드
  moderator.showModal(roomId, "제목", "밤 시작", 500, "닉네임", true);

  //NOTE - 모든 플레이어들의 카메라와 마이크 끔
  console.log("카메라, 마이크 끔");
  allPlayers.forEach((player) => {
    moderator.turnOffCamera(roomId, player.userId);
    moderator.turnOffMike(roomId, player.userId);
  });

  //NOTE - 플레이어들을 무작위로 섞음
  allPlayers = moderator.shufflePlayers(allPlayers);

  //NOTE - 모든 유저들 작업
  moderator.showModal(
    roomId,
    "제목",
    "마피아를 뽑겠습니다.",
    500,
    "닉네임",
    true
  );

  //NOTE - 마피아 인원 수만큼 플레이어들에게 마피아 역할 배정
  console.log("마피아 역할 배정");
  for (let playerIndex = 0; playerIndex < maxMafiaCount; playerIndex++) {
    await moderator.setPlayerRole(allPlayers[playerIndex], "마피아");
  }

  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들에게 자신이 마피아인 것을 알리고 마피아인 유저가 누구인지 공개
  console.log("역할 공개");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((roleUserId) =>
      moderator.openPlayerRole(clientUserId, roleUserId, "마피아")
    )
  );

  moderator.showModal(
    roomId,
    "제목",
    "마피아들은 고개를 들어 서로를 확인해 주세요.",
    500,
    "닉네임",
    true
  );

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

  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 끔
  console.log("마피아 유저들의 카메라, 마이크 끔");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((playerUserId) => {
      moderator.turnOffCamera(clientUserId, playerUserId);
      moderator.turnOffMike(clientUserId, playerUserId);
    })
  );

  if (maxDoctorCount !== 0) {
    console.log("의사 수", maxDoctorCount);
    moderator.showModal(
      roomId,
      "제목",
      "의사를 뽑겠습니다.",
      500,
      "닉네임",
      false
    );

    console.log("의사 뽑음");
    doctorPlayer = await moderator.setPlayerRole(
      allPlayers[maxMafiaCount],
      "의사"
    );
    moderator.openPlayerRole(doctorPlayer, doctorPlayer, "의사"); //NOTE - 의사 플레이어의 화면에서 자신이 의사임을 알림
  }

  if (maxPoliceCount !== 0) {
    moderator.showModal(
      roomId,
      "제목",
      "경찰을 뽑겠습니다.",
      500,
      "닉네임",
      false
    );

    console.log("경찰 뽑음");
    await moderator.setPlayerRole(allPlayers[maxMafiaCount + 1], "경찰");

    policePlayer = moderator.getPlayerByRole(
      allPlayers[maxMafiaCount + 1],
      "경찰"
    ); //NOTE - 참가자를 경찰 플레이어로 설정
    moderator.openPlayerRole(policePlayer, policePlayer, "경찰"); //NOTE - 경찰 플레이어의 화면에서 자신이 경찰임을 알림
  }

  citizenPlayers = await moderator.getPlayerByRole(roomId, "시민");

  //NOTE - 시민 플레이어의 화면에서 자신이 시민임을 알림
  console.log("시민들 각자 역할 공개");
  citizenPlayers.forEach((clientUserId) =>
    moderator.openPlayerRole(clientUserId, clientUserId, "시민")
  );

  moderator.showModal(
    roomId,
    "제목",
    "밤이 종료되었습니다.",
    500,
    "닉네임",
    false
  );

  moderator.showModal(
    roomId,
    "제목",
    "라운드가 종료되었습니다.",
    500,
    "닉네임",
    false
  );

  moderator.showModal(
    roomId,
    "제목",
    "라운드가 시작되었습니다.",
    500,
    "닉네임",
    false
  );

  moderator.showModal(
    roomId,
    "제목",
    "아침이 시작되었습니다.",
    500,
    "닉네임",
    false
  );

  //NOTE - 모든 플레이어들의 카메라와 마이크 켬
  console.log("카메라, 마이크 켬");
  allPlayers.forEach((player) => {
    moderator.turnOnCamera(roomId, player);
    moderator.turnOnMike(roomId, player);
  });

  moderator.showModal(
    roomId,
    "제목",
    "모든 유저는 토론을 통해 마피아를 찾아내세요.",
    500,
    "닉네임",
    false
  );

  moderator.waitForMs(500);

  moderator.showModal(
    roomId,
    "제목",
    "토론이 끝났습니다.",
    500,
    "닉네임",
    false
  );

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

  const voteBoard = await moderator.getPlayersVoteResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  const mostVoteResult = moderator.getMostVotedPlayer(voteBoard); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)
  //await moderator.resetVote(roomId); //NOTE - 플레이어들이 한 투표 기록 리셋, 테스트용으로 잠시 주석처리

  moderator.showVoteToResult(roomId, voteBoard);
  if (mostVoteResult.isValid) {
    //NOTE - 투표 성공

    moderator.showModal(
      roomId,
      "제목",
      `${mostVoteResult.result.user_nickname}님이 마피아로 지목되었습니다.`,
      500,
      "닉네임",
      false
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
    const yesOrNoVoteResult = await moderator.getYesOrNoVoteResult(roomId); //NOTE - 찬반 투표 결과 (확정X, 동률 나올 수 있음)
    moderator.showVoteYesOrNoResult(roomId, yesOrNoVoteResult.detail); //NOTE - 투표 결과를 방의 유저들에게 보여줌
    // await moderator.resetVote(roomId); //NOTE - 투표 결과 리셋, 테스트 상 주석
    //NOTE - 투표 결과가 유효하고(동률이 아님), 찬성이 반대보다 많은 경우
    if (yesOrNoVoteResult.isValid && yesOrNoVoteResult.result) {
      killedPlayer = await moderator.killPlayer(mostVoteResult.result.user_id); //NOTE - 투표를 가장 많이 받은 플레이어 사망

      mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아");
      doctorPlayer = await moderator.getPlayerByRole(roomId, "의사");
      policePlayer = await moderator.getPlayerByRole(roomId, "경찰");
      citizenPlayers = await moderator.getPlayerByRole(roomId, "시민");

      isPlayerMafia = moderator.checkPlayerMafia(killedPlayer); //NOTE - 죽은 플레이어가 마피아인지 확인

      //NOTE - 죽은 플레이어가 마피아인지 시민인지 알림
      if (isPlayerMafia) {
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

  moderator.showModal(
    roomId,
    "제목",
    "아침이 종료되었습니다.",
    500,
    "닉네임",
    false
  );

  moderator.showModal(
    roomId,
    "제목",
    "밤이 시작되었습니다.",
    500,
    "닉네임",
    false
  );

  //NOTE - 모든 플레이어들의 카메라와 마이크 끔
  console.log("카메라, 마이크 끔");
  allPlayers.forEach((player) => {
    moderator.turnOffCamera(roomId, player.userId);
    moderator.turnOffMike(roomId, player.userId);
  });

  moderator.showModal(
    roomId,
    "제목",
    "마피아는 누구를 죽일지 결정해주세요.",
    500,
    "닉네임",
    false
  );

  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아"); //NOTE - 마피아 플레이어 참조 전에 실행

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 켬
  console.log("마피아 유저들의 카메라, 마이크 켬");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((playerUserId) => {
      moderator.turnOnCamera(clientUserId, playerUserId);
      moderator.turnOnMike(clientUserId, playerUserId);
    })
  );

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

  playerToKill = await moderator.checkChosenPlayer(roomId, "마피아"); //NOTE - 가장 먼저 선택한 마피아의 지시를 따름, 죽일 플레이어 결정

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 끔
  console.log("마피아 유저들의 카메라, 마이크 끔");
  mafiaPlayers.forEach((clientUserId) =>
    mafiaPlayers.forEach((playerUserId) => {
      moderator.turnOffCamera(clientUserId, playerUserId);
      moderator.turnOffMike(clientUserId, playerUserId);
    })
  );

  //NOTE - 방 구성인원 중 의사가 있을 경우
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
    if (doctorPlayer) {
      moderator.waitForMs(500); //NOTE - 시간 재기

      playerToSave = await moderator.checkChosenPlayer(roomId, "의사"); //NOTE - 의사가 살릴 플레이어를 선택
    }
  }

  //NOTE - 방 구성인원 중 경찰 있을 경우
  if (moderator.maxPoliceCount !== 0) {
    moderator.showModal(
      roomId,
      "제목",
      "경찰은 마피아 의심자를 결정해주세요.",
      500,
      "닉네임",
      false
    );

    //NOTE - 경찰이 살아있을 경우
    policePlayer = await moderator.getPlayerByRole(roomId, "경찰");
    if (policePlayer) {
      const playerDoubted = moderator.checkChosenPlayer(roomId, "경찰"); //NOTE - 0번 인덱스 플레이어가 마피아인지 의심
      isPlayerMafia = mafiaPlayers.checkPlayerMafia(playerDoubted);

      if (isPlayerMafia) {
        moderator.showModal(
          policePlayer,
          "제목",
          "해당 플레이어는 마피아가 맞습니다.",
          500,
          "닉네임",
          false
        );
      } else {
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

  mafiaPlayers = moderator.getPlayerByRole(roomId, "마피아");

  //NOTE - 죽일 플레이어와 살릴 플레이어 결정하고 생사 결정
  if (playerToKill !== playerToSave) {
    if (mafiaPlayers) {
      moderator.killPlayer(playerToKill);
    }

    if (doctorPlayer) {
      moderator.savePlayer(playerToSave);
    }
  }

  mafiaPlayers = await moderator.getPlayerByRole(roomId, "마피아");
  doctorPlayer = await moderator.getPlayerByRole(roomId, "의사");
  policePlayer = await moderator.getPlayerByRole(roomId, "경찰");
  citizenPlayers = await moderator.getPlayerByRole(roomId, "시민");

  moderator.showModal(
    roomId,
    "제목",
    "밤이 종료되었습니다.",
    500,
    "닉네임",
    false
  );

  moderator.showModal(
    roomId,
    "제목",
    "라운드가 종료되었습니다.",
    500,
    "닉네임",
    false
  );

  moderator.showModal(
    roomId,
    "제목",
    "라운드가 시작되었습니다.",
    500,
    "닉네임",
    false
  );

  moderator.showModal(
    roomId,
    "제목",
    "아침이 시작되었습니다.",
    500,
    "닉네임",
    false
  );

  //NOTE - 모든 플레이어들의 카메라와 마이크 켬
  console.log("카메라, 마이크 켬");
  allPlayers.forEach((player) => {
    moderator.turnOnCamera(roomId, player.userId);
    moderator.turnOnMike(roomId, player.userId);
  });

  //NOTE - 마피아가 죽일려고한 마피아가 살았는지 죽었는지 확인
  isPlayerLived = await moderator.checkPlayerLived(killedPlayer);
  killedPlayerNickname = await moderator.getPlayerNickname(killedPlayer);
  if (isPlayerLived) {
    moderator.showModal(
      roomId,
      "제목",
      "의사의 활약으로 아무도 죽지 않았습니다.",
      500,
      "닉네임",
      false
    );
  } else {
    moderator.showModal(
      roomId,
      "제목",
      `${killedPlayerNickname}님이 죽었습니다.`,
      500,
      "닉네임",
      false
    );
  }

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

  moderator.showModal(
    roomId,
    "제목",
    "아침이 종료되었습니다.",
    500,
    "닉네임",
    false
  );

  moderator.showModal(
    roomId,
    "제목",
    "라운드가 종료되었습니다.",
    500,
    "닉네임",
    false
  );

  if (moderator.whoWins.isValid) {
    //NOTE - 게임 종료 만족하는 지
    moderator.showModal(
      roomId,
      "제목",
      `${moderator.whoWins.result} 팀이 이겼습니다.`,
      500,
      "닉네임",
      false
    );

    moderator.showModal(
      roomId,
      "제목",
      "게임이 종료되었습니다.",
      500,
      "닉네임",
      false
    );
  }
};
