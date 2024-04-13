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
import { Citizen } from "./mafia-algorithm/class/citizenClass.js";
import { Mafia } from "./mafia-algorithm/class/mafiaClass.js";

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
  playMafia("12dc28ad-4764-460f-9a54-58c31fdacd1f", 5); //NOTE - 테스트 코드
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
  console.log("마피아 시작");

  const moderator = new Moderator(totalUserCount, mafiaIo); //NOTE - 사회자 생성

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

  const users = await moderator.getAllUserInfo(roomId);
  users.forEach((user, index) => {
    moderator.players[index] = new Citizen(user.user_id, user.user_nickname);
  });
  console.log(moderator.players);

  console.log("라운드 시작"); //NOTE - 테스트 코드
  moderator.showModal(roomId, "제목", "라운드 시작", 500, "닉네임", true);

  console.log("밤 시작"); //NOTE - 테스트 코드
  moderator.showModal(roomId, "제목", "밤 시작", 500, "닉네임", true);

  //NOTE - 모든 플레이어들의 카메라와 마이크 끔
  console.log("카메라, 마이크 끔");
  moderator.players.forEach((player) => {
    moderator.turnOffCamera(roomId, player);
    moderator.turnOffMike(roomId, player);
  });

  //NOTE - 플레이어들을 무작위로 섞음
  moderator.shufflePlayers();

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
  for (
    let playerIndex = 0;
    playerIndex < moderator.roomComposition.mafiaCount;
    playerIndex++
  ) {
    randomPlayer = moderator.players[playerIndex]; //NOTE - 랜덤으로 플레이어 선택
    moderator.players[playerIndex] = new Mafia(randomPlayer); //NOTE - 플레이어들의 역할을 마피아로 지정
    moderator.setPlayerRole(players[playerIndex]);
  }

  moderator.setRoles();
  mafiaPlayers = moderator.roles["마피아"];

  /*
  //NOTE - 마피아 인원 수만큼 플레이어들에게 마피아 역할 배정
  for (let playerIndex = 0; playerIndex < mafiaCount; playerIndex++) {
    randomPlayer = moderator.players[playerIndex]; //NOTE - 랜덤으로 플레이어 선택
    moderator.players[playerIndex] = new Mafia(randomPlayer); //NOTE - 플레이어들의 역할을 마피아로 지정
  }

  moderator.setRoles();
  mafiaPlayers = moderator.roles["마피아"];

  //NOTE - 마피아 유저들에게 자신이 마피아인 것을 알리고 마피아인 유저가 누구인지 공개
  mafiaPlayers.forEach((clientPlayer) =>
    mafiaPlayers.forEach((rolePlayer) =>
      moderator.openPlayerRole(clientPlayer, rolePlayer, "마피아")
    )
  );

  moderator.players.forEach((player) =>
    moderator.speak(player, "마피아 들은 고개를 들어 서로를 확인해 주세요.")
  );

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 켬
  mafiaPlayers.forEach((clientPlayer) =>
    mafiaPlayers.forEach((player) => {
      moderator.turnOnCamera(clientPlayer, player);
      moderator.turnOnMike(clientPlayer, player);
    })
  );

  moderator.startTimer(90); //NOTE - 시간 재기

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 끔
  mafiaPlayers.forEach((clientPlayer) =>
    mafiaPlayers.forEach((player) => {
      moderator.turnOffCamera(clientPlayer, player);
      moderator.turnOffMike(clientPlayer, player);
    })
  );

  moderator.players.forEach((player) =>
    moderator.speak(player, "의사를 뽑겠습니다.")
  );

  randomPlayer = moderator.players[mafiaCount]; //NOTE - 랜덤으로 플레이어 선택
  moderator.players[mafiaCount] = new Doctor(randomPlayer); //NOTE - 참가자를 의사 플레이어로 설정

  moderator.setRoles();
  doctorPlayer = moderator.roles["의사"];

  moderator.openPlayerRole(doctorPlayer, doctorPlayer, "의사"); //NOTE - 의사 플레이어의 화면에서 자신이 의사임을 알림

  moderator.players.forEach((player) =>
    moderator.speak(player, "경찰을 뽑겠습니다.")
  );

  randomPlayer = moderator.players[mafiaCount + 1]; //NOTE - 랜덤으로 플레이어 선택
  moderator.players[mafiaCount + 1] = new Police(randomPlayer); //NOTE - 참가자를 경찰 플레이어로 설정

  moderator.setRoles();
  policePlayer = moderator.roles["경찰"];

  moderator.openPlayerRole(policePlayer, policePlayer, "경찰"); //NOTE - 경찰 플레이어의 화면에서 자신이 경찰임을 알림

  citizenPlayers = moderator.roles["시민"];

  //NOTE - 시민 플레이어의 화면에서 자신이 시민임을 알림
  citizenPlayers.forEach((citizenPlayer) =>
    moderator.openPlayerRole(citizenPlayer, citizenPlayer, "시민")
  );

  moderator.nightOver(); //NOTE - 밤 종료
  moderator.roundOver(); //NOTE - 라운드 종료

  moderator.roundStart(); //NOTE - 라운드 시작
  moderator.morningStart(); //NOTE - 아침 시작

  //NOTE - 모든 플레이어들의 화면과 마이크 켬
  moderator.players.forEach((clientPlayer) =>
    moderator.players.forEach((player) => {
      moderator.turnOnCamera(clientPlayer, player);
      moderator.turnOnMike(clientPlayer, player);
    })
  );

  moderator.players.forEach((player) =>
    moderator.speak(player, "모든 유저는 토론을 통해 마피아를 찾아내세요.")
  );

  moderator.startTimer(90); //NOTE - 시간 재기

  moderator.players.forEach((player) =>
    moderator.speak(player, "토론이 끝났습니다.")
  );

  moderator.players.forEach((player) =>
    moderator.speak(player, "마피아일 것 같은 사람의 화면을 클릭해주세요.")
  );

  moderator.players[0].voteToPlayer(moderator.players[1]); //NOTE - 0번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[1].voteToPlayer(moderator.players[2]); //NOTE - 1번 인덱스 플레이어가 2번 인덱스 플레이어에게 투표
  moderator.players[2].voteToPlayer(moderator.players[1]); //NOTE - 2번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[3].voteToPlayer(moderator.players[1]); //NOTE - 3번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[4].voteToPlayer(moderator.players[1]); //NOTE - 4번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[5].voteToPlayer(moderator.players[1]); //NOTE - 5번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[6].voteToPlayer(moderator.players[2]); //NOTE - 6번 인덱스 플레이어가 2번 인덱스 플레이어에게 투표
  moderator.players[7].voteToPlayer(moderator.players[1]); //NOTE - 7번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표

  moderator.startTimer(90); //NOTE - 시간 재기

  const voteBoard = moderator.getPlayersVoteResult(); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  const mostVoteResult = moderator.getMostVotedPlayer(); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)

  moderator.resetVote(); //NOTE - 플레이어들이 한 투표 기록 리셋
  moderator.players.forEach((player) => moderator.showVoteResult(voteBoard));

  if (mostVoteResult.isValid) {
    //NOTE - 투표 성공

    moderator.players.forEach((player) =>
      moderator.speak(
        player,
        `${mostVoteResult.result.userNickname}님이 마피아로 지복되었습니다.`
      )
    );

    moderator.players.forEach((player) =>
      moderator.speak(
        player,
        `${mostVoteResult.result.userNickname}님은 최후의 변론을 시작하세요.`
      )
    );

    moderator.startTimer(90); //NOTE - 시간 재기

    moderator.players.forEach((player) =>
      moderator.speak(player, "찬성/반대 투표를 해주세요.")
    );

    moderator.startTimer(90); //NOTE - 시간 재기

    moderator.players[0].voteYesOrNo(votes, false); //NOTE - 0번 인덱스 플레이어가 찬성에 투표
    moderator.players[1].voteYesOrNo(votes, true); //NOTE - 1번 인덱스 플레이어가 찬성에 투표
    moderator.players[2].voteYesOrNo(votes, true); //NOTE - 2번 인덱스 플레이어가 찬성에 투표
    moderator.players[3].voteYesOrNo(votes, false); //NOTE - 3번 인덱스 플레이어가 반대에 투표
    moderator.players[4].voteYesOrNo(votes, false); //NOTE - 4번 인덱스 플레이어가 반대에 투표
    moderator.players[5].voteYesOrNo(votes, false); //NOTE - 5번 인덱스 플레이어가 찬성에 투표
    moderator.players[6].voteYesOrNo(votes, true); //NOTE - 6번 인덱스 플레이어가 찬성에 투표
    moderator.players[7].voteYesOrNo(votes, true); //NOTE - 7번 인덱스 플레이어가 찬성에 투표

    const yesOrNoVoteResult = moderator.getYesOrNoVoteResult(votes); //NOTE - 찬반 투표 결과 (확정X, 동률 나올 수 있음)

    moderator.showVoteResult(yesOrNoVoteResult.result.detail);

    //NOTE - 투표 결과가 유효하고(동률이 아님), 찬성이 반대보다 많은 경우
    if (yesOrNoVoteResult.isValid && yesOrNoVoteResult.result) {
      killedPlayer = moderator.killPlayer(mostVoteResult); //NOTE - 투표를 가장 많이 받은 플레이어 사망

      moderator.setRoles();
      mafiaPlayers = moderator.roles["마피아"];
      doctorPlayer = moderator.roles["의사"];
      policePlayer = moderator.roles["경찰"];
      citizenPlayers = moderator.roles["시민"];

      isPlayerMafia = mafiaPlayers.indexOf(killedPlayer) !== -1; //NOTE - 죽은 플레이어가 마피아인지 확인

      //NOTE - 죽은 플레이어가 마피아인지 시민인지 알림
      moderator.players.forEach((player) =>
        isPlayerMafia
          ? moderator.speak(player, "마피아가 죽었습니다.")
          : moderator.speak(player, "시민이 죽었습니다.")
      );

      moderator.players.forEach((clientPlayer) => {
        const role = isPlayerMafia ? "마피아" : "시민";

        moderator.openPlayerRole(clientPlayer, killedPlayer, role);
      });
    } else {
      //NOTE - 투표 실패, 동률이 나옴
      console.log("동률 나옴");
    }
  }

  moderator.morningOver(); //NOTE - 아침 종료
  moderator.nightStart(); //NOTE - 밤이 시작됨

  //NOTE - 모든 유저들 화상 카메라와 마이크만 끔
  moderator.players.forEach((clientPlayer) =>
    moderator.players.forEach((player) => {
      moderator.turnOffCamera(clientPlayer, player);
      moderator.turnOffMike(clientPlayer, player);
    })
  );

  moderator.players.forEach((player) =>
    moderator.speak(player, "마피아는 누구를 죽일지 결정해주세요.")
  );

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 켬
  mafiaPlayers.forEach((clientPlayer) => {
    mafiaPlayers.forEach((player) => {
      moderator.turnOnCamera(clientPlayer, player);
      moderator.turnOnMike(clientPlayer, player);
    });
  });

  mafiaPlayers.forEach((mafiaPlayer) => {
    moderator.speak(mafiaPlayer, "제스처를 통해 상의하세요.");
    moderator.speak(mafiaPlayer, "누구를 죽일지 선택하세요.");
  });

  moderator.startTimer(90); //NOTE - 시간 재기
  playerToKill = mafiaPlayers[0].choosePlayer(moderator.players[0]); //NOTE - 가장 먼저 선택한 마피아의 지시를 따름, 죽일 플레이어 결정

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 끔
  mafiaPlayers.forEach((clientPlayer) => {
    mafiaPlayers.forEach((player) => {
      moderator.turnOffCamera(clientPlayer, player);
      moderator.turnOffMike(clientPlayer, player);
    });
  });

  mafiaPlayers.forEach((player) =>
    moderator.speak(player, "의사는 누구를 살릴 지 결정하세요.")
  );

  //NOTE - 의사가 살아있을 경우
  if (moderator.roles["의사"] !== undefined) {
    doctorPlayer = moderator.roles["의사"]; //NOTE - 역할이 의사인 플레이어 인덱스 반환

    moderator.startTimer(90); //NOTE - 시간 재기

    playerToSave = doctorPlayer.choosePlayer(moderator.players[0]); //NOTE - 의사가 살릴 플레이어를 선택
  }

  moderator.players.forEach((player) =>
    moderator.speak(player, "경찰은 마피아 의심자를 결정해주세요.")
  );

  //NOTE - 경찰이 살아있을 경우
  if (moderator.roles["경찰"] !== undefined) {
    policePlayer = moderator.roles["경찰"];

    isPlayerMafia = policePlayer.checkPlayerMafia(moderator.players[0]); //NOTE - 0번 인덱스 플레이어가 마피아인지 의심

    isPlayerMafia
      ? moderator.speak(policePlayer, "해당 플레이어는 마피아가 맞습니다.")
      : moderator.speak(policePlayer, "해당 플레이어는 마피아가 아닙니다.");
  }

  //NOTE - 죽일 플레이어와 살릴 플레이어 결정하고 생사 결정
  if (playerToKill !== playerToSave) {
    mafiaPlayers[0].killPlayer(playerToKill);
    doctorPlayer.savePlayer(playerToSave);
  }

  moderator.setRoles();
  mafiaPlayers = moderator.roles["마피아"];
  doctorPlayer = moderator.roles["의사"];
  policePlayer = moderator.roles["경찰"];
  citizenPlayers = moderator.roles["시민"];

  moderator.nightOver(); //NOTE - 밤 종료
  moderator.roundOver(); //NOTE - 라운드 종료
  moderator.roundStart(); //NOTE - 라운드 시작
  moderator.morningStart(); //NOTE - 아침 시작

  //NOTE - 모든 유저들 화상 카메라와 마이크만 켬
  moderator.players.forEach((clientPlayer) =>
    moderator.players.forEach((player) => {
      moderator.turnOnCamera(clientPlayer, player);
      moderator.turnOnMike(clientPlayer, player);
    })
  );

  //NOTE - 마피아가 죽일려고한 마피아가 살았는지 죽었는지 확인
  if (killedPlayer.isLived) {
    moderator.players.forEach((player) =>
      moderator.speak(player, "의사의 활약으로 아무도 죽지 않았습니다.")
    );
  } else {
    moderator.players.forEach((player) =>
      moderator.speak(player, `${killedPlayer.userNickname}님이 죽었습니다.`)
    );
  }

  moderator.speak(killedPlayer, "게임을 관전 하시겠습니까? 나가시겠습니까?");
  choiceToExit = true; //NOTE - 나간다고 가정

  //NOTE - 방을 나갈지 관전할지
  if (choiceToExit) {
    killedPlayer.exit(); //NOTE - 플레이어는 방을 나감, 중간에 나가는 경우에도 사용할 수 있음
  }
  moderator.morningOver(); //NOTE - 아침 종료
  moderator.roundOver(); //NOTE - 라운드 종료

  if (moderator.whoWins.isValid) {
    //NOTE - 게임 종료 만족하는 지
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      moderator.speak(
        players,
        playerIndex`${moderator.whoWins.result} 팀이 이겼습니다.`
      ); //NOTE - 어느 팀이 이겼는지 알림
    }

    gameOver(); //NOTE - 게임 종료
  }

  
   */
};
