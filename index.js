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
  getPlayersInRoom,
  getRound,
  getSelectedPlayer,
  getStatus,
  getVoteToResult,
  killPlayer,
  resetPlayerStatus,
  resetVote,
  savePlayer,
  selectPlayer,
  setPlayerRole,
  setStatus,
  updateRound,
  voteTo,
  voteYesOrNo,
} from "./api/supabase/gamePlayAPI.js";
import {
  getMostVotedPlayer,
  getRoleMaxCount,
  getYesOrNoVoteResult,
  showVoteToResult,
  showVoteYesOrNoResult,
  showWhoWins,
  shufflePlayers,
  updateUserInRoom,
  whoWins,
} from "./api/socket/moderatorAPI.js";

const app = express();
const httpServer = createServer(app);
const port = 4000;
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    origin: "*",
  },
});
const mafiaIo = io.of("/mafia");

app.get("/", (req, res) => {
  res.send("express 서버와 연결되어 있습니다.");
});

mafiaIo.on("connection", (socket) => {
  socket.join("0ed9a099-f1b4-46eb-a187-2da752eed29c"); //NOTE - 테스트용 코드
  socket.join("11111111-f1b4-46eb-a187-2da752eed29c"); //NOTE - 테스트용 코드
  socket.data.userId = "11111111-f1b4-46eb-a187-2da752eed29c"; //NOTE - 테스트용 코드
  socket.data.roomId = "0ed9a099-f1b4-46eb-a187-2da752eed29c"; //NOTE - 테스트용 코드

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
      const isValid = await setStatus(userId, roomId, "is_ready", ready);
      if (!isValid) {
        throw new Error();
      }
    } catch (error) {
      console.log("[setReadyError]");
      socket.emit("setReadyError", "레디를  설정하는데 실패했습니다.");
      return;
    }
    mafiaIo.to(roomId).emit("updateUserReady", userId, ready);
    canGameStart(roomId);
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

  socket.on("testStart", async (roomId, playersMaxCount) => {
    console.log(
      `[testStart 수신] roomId : ${roomId} | 총 인원 : ${playersMaxCount}`
    );

    let roundName = "r1-14";
    let allPlayers = null;

    //NOTE - 플레이상 안쓰면 삭제
    let mafiaMaxCount = null;
    let doctorMaxCount = null;
    let policeMaxCount = null;

    let voteBoard = null;
    let mostVoteResult = null;
    let yesOrNoVoteResult = null;

    let time = 1;

    const start = setInterval(async () => {
      time--;

      if (time <= 0) {
        allPlayers = await getPlayersInRoom(roomId);

        //FIXME - 승리 조건 넣기 (플레이어가 죽었을 때, 중도 이탈 시)
        //FIXME - 플레이어 사망 처리 넣기
        //FIXME - showModal 메서드로 만들기
        //FIXME - 각 역할의 플레이어 유저 아이디 반환 메서드 만들기

        if (roundName == "init") {
          //FIXME - 초기 설정 넣기
          await resetPlayerStatus(roomId);
        }

        if (roundName === "r0-0") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          allPlayers.forEach((player) => {
            media[player.user_id] = { camera: false, mike: false };
          });

          console.log(
            `[${roundName}] playerMediaStatus : 모든 유저 카메라 마이크 끔`
          );
          console.log(media);
          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          console.log(`${roundName} 종료`);
          roundName = "r0-1";
        } else if (roundName === "r0-1") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          console.log(`[${roundName}] showModal :  밤이 되었습니다. / 3초`);
          mafiaIo.to(roomId).emit("showModal", "밤이 되었습니다.", time);

          console.log(`${roundName} 종료`);
          roundName = "r0-2";
        } else if (roundName === "r0-2") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 10초

          let playersUserId = allPlayers.map((player) => player.user_id);
          [mafiaMaxCount, doctorMaxCount, policeMaxCount] =
            getRoleMaxCount(playersMaxCount); //FIXME - 각 요소들이 필요한지 보고 필요없으면 삭제

          let mafiaPlayers = null;
          let doctorPlayer = null;
          let policePlayer = null;
          let citizenPlayers = null;

          playersUserId = shufflePlayers(playersUserId);

          console.log("총 플레이어", playersUserId);
          console.log("최대 마피아 인원 수", mafiaMaxCount);
          console.log("최대 의사 인원 수", doctorMaxCount);
          console.log("최대 경찰 인원 수", policeMaxCount);

          //NOTE - 처음에는 모든 플레이어 시민으로 설정
          for (
            let playerIndex = 0;
            playerIndex < playersMaxCount;
            playerIndex++
          ) {
            await setPlayerRole(playersUserId[playerIndex], "시민"); //FIXME - 초기 설정이 시민이라 필요한지 생각해보기
          }

          //NOTE - 마피아 인원 수만큼 플레이어들에게 마피아 역할 배정
          for (
            let playerIndex = 0;
            playerIndex < mafiaMaxCount;
            playerIndex++
          ) {
            await setPlayerRole(playersUserId[playerIndex], "마피아");
          }

          if (doctorMaxCount !== 0) {
            console.log("의사 역할 배정");
            await setPlayerRole(playersUserId[mafiaMaxCount], "의사");
          }

          if (policeMaxCount !== 0) {
            console.log("경찰 역할 배정");
            await setPlayerRole(playersUserId[mafiaMaxCount + 1], "경찰");
          }

          allPlayers = await getPlayersInRoom(roomId);
          mafiaPlayers = allPlayers
            .filter((player) => player.role == "마피아")
            .map((player) => player.user_id);

          if (doctorMaxCount > 0) {
            doctorPlayer = allPlayers
              .find((player) => player.role == "의사")
              .map((player) => player.user_id);
          }

          if (policeMaxCount) {
            policePlayer = allPlayers
              .find((player) => player.role == "경찰")
              .map((player) => player.user_id);
          }

          citizenPlayers = allPlayers
            .filter((player) => player.role == "시민")
            .map((player) => player.user_id);

          let role = {};

          role["mafia"] = mafiaPlayers;

          if (doctorPlayer) {
            role["doctor"] = doctorPlayer;
          } else {
            role["doctor"] = null;
          }

          if (policePlayer) {
            role["police"] = policePlayer;
          } else {
            role["police"] = null;
          }

          role["citizen"] = citizenPlayers;

          console.log(
            `[${roundName}] showAllPlayerRole : 플레이어들 역할 / 10초`
          );
          console.log(role);
          mafiaIo.to(roomId).emit("showAllPlayerRole", role, time);

          console.log(`${roundName} 종료`);
          roundName = "r0-3";
        } else if (roundName === "r0-3") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 5초

          console.log(
            `[${roundName}] showModal : 마피아들은 고개를 들어 서로를 확인해주세요. / 5초`
          );
          mafiaIo
            .to(roomId)
            .emit(
              "showModal",
              "마피아들은 고개를 들어 서로를 확인해주세요.",
              time
            );

          console.log(`${roundName} 종료`);
          roundName = "r0-4";
        } else if (roundName === "r0-4") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived == true)
            .filter((player) => player.role == "마피아")
            .map((player) => player.user_id);

          mafiaPlayers.forEach(
            (userId) => (media[userId] = { camera: true, mike: false })
          );

          console.log(
            `[${roundName}] playerMediaStatus : 마피아 유저들 카메라 켬, 마이크 끔`
          );
          console.log(media);

          mafiaPlayers.forEach((userId) => {
            mafiaIo.to(userId).emit("playerMediaStatus", media);
          });

          console.log(`${roundName} 종료`);
          roundName = "r0-5";
        } else if (roundName == "r0-5") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 5초

          console.log(`[${roundName}] timerStatus / 5초`);
          mafiaIo.to(roomId).emit("timerStatus", time);

          console.log(`${roundName} 종료`);
          roundName = "r0-6";
        } else if (roundName === "r0-6") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived == true)
            .filter((player) => player.role == "마피아")
            .map((player) => player.user_id);

          mafiaPlayers.forEach(
            (userId) => (media[userId] = { camera: false, mike: false })
          );

          console.log(
            `[${roundName}] playerMediaStatus : 마피아 유저들 카메라 끔, 마이크 끔`
          );
          console.log(media);

          mafiaPlayers.forEach((userId) => {
            mafiaIo.to(userId).emit("playerMediaStatus", media);
          });

          console.log(`${roundName} 종료`);
          roundName = "r1-0";
        } else if (roundName == "r1-0") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          console.log(
            `[${roundName}] showModal : 아침이 되었습니다. 모든 유저는 토론을 통해 마피아를 찾아내세요. / 3초`
          );
          mafiaIo
            .to(roomId)
            .emit(
              "showModal",
              "아침이 되었습니다. 모든 유저는 토론을 통해 마피아를 찾아내세요.",
              time
            );

          console.log(`${roundName} 종료`);
          roundName = "r1-1";
        } else if (roundName == "r1-1") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          allPlayers
            .filter((player) => player.is_lived == true)
            .forEach((player) => {
              media[player.user_id] = { camera: true, mike: true };
            });

          console.log(
            `[${roundName}] playerMediaStatus : 모든 유저 카메라 켬, 마이크 켬`
          );
          console.log(media);
          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          console.log(`${roundName} 종료`);
          roundName = "r1-2";
        } else if (roundName == "r1-2") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 60초

          console.log(`[${roundName}] timerStatus / 60초`);
          mafiaIo.to(roomId).emit("timerStatus", time);

          console.log(`${roundName} 종료`);
          roundName = "r1-3";
        } else if (roundName == "r1-3") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          allPlayers
            .filter((player) => player.is_lived == true)
            .forEach((player) => {
              media[player.user_id] = { camera: true, mike: false };
            });

          console.log(
            `[${roundName}] playerMediaStatus : 모든 유저 카메라 켬, 마이크 끔`
          );
          console.log(media);
          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          console.log(`${roundName} 종료`);
          roundName = "r1-4";
        } else if (roundName == "r1-4") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          console.log(
            `[${roundName}] showModal : 토론이 끝났습니다. 마피아일 것 같은 사람의 화면을 클릭하세요. / 3초`
          );
          mafiaIo
            .to(roomId)
            .emit(
              "showModal",
              "토론이 끝났습니다. 마피아일 것 같은 사람의 화면을 클릭하세요.",
              time
            );

          console.log(`${roundName} 종료`);
          roundName = "r1-5";
        } else if (roundName == "r1-5") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 10초

          console.log(`[${roundName}] inSelect : vote /  10초`);
          mafiaIo.to(roomId).emit("inSelect", "vote", time);

          console.log(`${roundName} 종료`);
          roundName = "r1-6";
        } else if (roundName == "r1-6") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 5초

          voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
          //await resetVote(roomId); //NOTE - 플레이어들이 한 투표 기록 리셋, 테스트용으로 잠시 주석처리
          console.log(
            `[${roundName}] showVoteResult : 마피아 의심 투표 결과 / 5초`
          );
          console.log(voteBoard);
          mafiaIo.to(roomId).emit("showVoteResult", voteBoard, time);

          console.log(`${roundName} 종료`);
          roundName = "r1-7";
        } else if (roundName == "r1-7") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          mostVoteResult = getMostVotedPlayer(voteBoard); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)

          if (mostVoteResult.isValid) {
            console.log(
              `[${roundName}] showModal : ${mostVoteResult.result.user_nickname}님은 최후의 변론을 시작하세요. / 3초`
            );
            mafiaIo
              .to(roomId)
              .emit(
                "showModal",
                `${mostVoteResult.result.user_nickname}님은 최후의 변론을 시작하세요.`,
                time
              );

            console.log(`${roundName} 종료`);
            roundName = "r1-8";
          } else {
            console.log(
              `[${roundName}] showModal : 동률로 인해 아무도 죽지 않았습니다. / 3초`
            );
            mafiaIo
              .to(roomId)
              .emit("showModal", "동률로 인해 아무도 죽지 않았습니다.", time);

            console.log(`${roundName} 종료`);
            roundName = "r1-14";
          }
        } else if (roundName == "r1-8") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          allPlayers
            .filter(
              (player) => player.user_id === mostVoteResult.result.user_id
            )
            .forEach((player) => {
              media[player.user_id] = { camera: true, mike: true };
            });

          console.log(
            `[${roundName}] playerMediaStatus : 최대 투표를 받은 유저 카메라 켬, 마이크 켬`
          );
          console.log(media);
          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          console.log(`${roundName} 종료`);
          roundName = "r1-9";
        } else if (roundName == "r1-9") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 10초

          console.log(`[${roundName}] timerStatus : 10초`);
          mafiaIo.to(roomId).emit("timerStatus", time);

          console.log(`${roundName} 종료`);
          roundName = "r1-10";
        } else if (roundName == "r1-10") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          allPlayers
            .filter(
              (player) => player.user_id === mostVoteResult.result.user_id
            )
            .forEach((player) => {
              media[player.user_id] = { camera: true, mike: false };
            });

          console.log(
            `[${roundName}] playerMediaStatus : 모든 유저 카메라 켬, 마이크 끔`
          );
          console.log(media);
          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          console.log(`${roundName} 종료`);
          roundName = "r1-11";
        } else if (roundName == "r1-11") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 10초

          console.log(
            `[${roundName}] showModal : 찬성/반대 투표를 해주세요. / 10초`
          );
          mafiaIo
            .to(roomId)
            .emit("showModal", "찬성/반대 투표를 해주세요.", time);

          console.log(`${roundName} 종료`);
          roundName = "r1-12";
        } else if (roundName == "r1-12") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 5초
          yesOrNoVoteResult = await getYesOrNoVoteResult(roomId); //NOTE - 찬반 투표 결과 (확정X, 동률 나올 수 있음)

          console.log(`[${roundName}] showVoteDeadOrLive / 5초`);
          console.log(yesOrNoVoteResult);
          mafiaIo
            .to(roomId)
            .emit("showVoteDeadOrLive", yesOrNoVoteResult, time);

          // await resetVote(roomId); //NOTE - 투표 결과 리셋, 테스트 상 주석처리

          console.log(`${roundName} 종료`);
          roundName = "r1-13";
        } else if (roundName == "r1-13") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          if (yesOrNoVoteResult.result) {
            console.log("투표 결과 유효함");
            const killedPlayer = await killPlayer(
              mostVoteResult.result.user_id
            ); //NOTE - 투표를 가장 많이 받은 플레이어 사망
            console.log(`[${roundName}] diedPlayer : ${killedPlayer}`);
            mafiaIo.to(roomId).emit("diedPlayer", killedPlayer);

            const isPlayerMafia = allPlayers
              .filter((player) => player.role === "마피아")
              .some((player) => player.user_id === killedPlayer);

            //NOTE - 죽은 플레이어가 마피아인지 시민인지 알림
            if (isPlayerMafia) {
              console.log(
                `[${roundName}] showModal : 마피아가 죽었습니다. / 3초`
              );
              mafiaIo
                .to(roomId)
                .emit("showModal", "마피아가 죽었습니다.", time);
            } else {
              console.log(
                `[${roundName}] showModal : 시민이 죽었습니다. / 3초`
              );
              mafiaIo.to(roomId).emit("showModal", "시민이 죽었습니다.", time);
            }
            const winResult = whoWins(allPlayers);
            if (winResult.isValid) {
              if (winResult.result === "시민") {
                console.log(`[${roundName}] victoryPlayer : citizen / 5초`);
                mafiaIo.to(roomId).emit("victoryPlayer", "citizen", 5);
              } else if (winResult.result === "마피아") {
                console.log(`[${roundName}] victoryPlayer : mafia / 5초`);
                mafiaIo.to(roomId).emit("victoryPlayer", "mafia", 5);
              }
              roundName = "r1-0"; //FIXME - 게임 초기화
            }
          } else {
            //NOTE - 투표 실패, 동률이 나옴
            console.log(
              `[${roundName}] showModal : 동률로 인해 아무도 죽지 않았습니다. / 3초`
            );
            mafiaIo.to(roomId).emit("showModal", "시민이 죽었습니다.", time);
          }

          console.log(`${roundName} 종료`);
          roundName = "r1-14";
        } else if (roundName == "r1-14") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          allPlayers.forEach((player) => {
            media[player.user_id] = { camera: false, mike: false };
          });

          console.log(
            `[${roundName}] playerMediaStatus : 모든 유저 카메라 끔, 마이크 끔`
          );
          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          console.log(`${roundName} 종료`);
          roundName = "r1-15";
        } else if (roundName === "r1-15") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          console.log(
            `[${roundName}] showModal : 밤이 되었습니다. 마피아는 제스처를 통해 상의 후 누구를 죽일 지 선택해주세요. / 3초`
          );
          mafiaIo
            .to(roomId)
            .emit(
              "showModal",
              "밤이 되었습니다. 마피아는 제스처를 통해 상의 후 누구를 죽일 지 선택해주세요.",
              time
            );

          console.log(`${roundName} 종료`);
          roundName = "r1-16";
        } else if (roundName === "r1-16") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived === true)
            .filter((player) => player.role === "마피아")
            .map((player) => player.user_id);

          mafiaPlayers.forEach(
            (userId) => (media[userId] = { camera: true, mike: false })
          );

          console.log(
            `[${roundName}] playerMediaStatus : 마피아 유저들 카메라 켬, 마이크 끔`
          );

          mafiaPlayers.forEach((userId) => {
            mafiaIo.to(userId).emit("playerMediaStatus", media);
          });

          console.log(`${roundName} 종료`);
          roundName = "r1-17";
        } else if (roundName === "r1-17") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 10초

          console.log(`[${roundName}] inSelect : mafia /  10초`);
          mafiaIo.to(roomId).emit("inSelect", "mafia", time);

          console.log(`${roundName} 종료`);
          roundName = "r1-18";
        } else if (roundName === "r1-18") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 10초

          let media = {};
          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived == true)
            .filter((player) => player.role == "마피아")
            .map((player) => player.user_id);

          mafiaPlayers.forEach(
            (userId) => (media[userId] = { camera: false, mike: false })
          );

          console.log(
            `[${roundName}] playerMediaStatus : 마피아 유저들 카메라 끔, 마이크 끔`
          );

          mafiaPlayers.forEach((userId) => {
            mafiaIo.to(userId).emit("playerMediaStatus", media);
          });

          console.log(`${roundName} 종료`);
          if (doctorMaxCount === 0 && policeMaxCount === 0) {
            roundName = "r2-0"; //FIXME - 의사, 경찰 역할 수행 스킵
          } else if (doctorMaxCount == 0 && policeMaxCount > 0) {
            roundName = "r1-21"; //FIXME - 의사 역할 수행 스킵
          } else {
            roundName = "r1-19";
          }
        } else if (roundName == "r1-19") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          console.log(
            `[${roundName}] showModal : 의사는 누구를 살릴 지 결정해주세요. / 3초`
          );
          mafiaIo
            .to(roomId)
            .emit("showModal", "의사는 누구를 살릴 지 결정해주세요.", time);

          console.log(`${roundName} 종료`);
          roundName = "r1-20";
        } else if (roundName == "r1-20") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 10초

          console.log(`[${roundName}] inSelect : doctor / 10초`);
          mafiaIo.to(roomId).emit("inSelect", "doctor", time);

          console.log(`${roundName} 종료`);
          if (policeMaxCount > 0) {
            roundName = "r1-21";
          } else {
            roundName = "r1-21"; //FIXME - 경찰 역할 수행 스킵
          }
        } else if (roundName == "r1-21") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          console.log(
            `[${roundName}] showModal : 경찰은 마피아 의심자를 결정해주세요. / 3초`
          );
          mafiaIo
            .to(roomId)
            .emit("showModal", "경찰은 마피아 의심자를 결정해주세요.", time);

          console.log(`${roundName} 종료`);
          roundName = "r1-22"; //FIXME - 경찰 역할 수행 스킵
        } else if (roundName == "r1-22") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 10초

          console.log(`[${roundName}] inSelect : police / 10초`);
          mafiaIo.to(roomId).emit("inSelect", "police", time);

          console.log(`${roundName} 종료`);
          roundName = "end";
        } else if (roundName == "r2-0") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          console.log(`[${roundName}] showModal : 아침이 되었습니다. / 3초`);
          mafiaIo.to(roomId).emit("showModal", "아침이 되었습니다.", time);

          console.log(`${roundName} 종료`);
          roundName = "r2-1"; //FIXME - 경찰 역할 수행 스킵
        } else if (roundName == "r2-1") {
          console.log(`${roundName} 시작`);
          time = 1;

          let media = {};
          allPlayers
            .filter((player) => player.is_lived == true)
            .forEach((player) => {
              media[player.user_id] = { camera: true, mike: true };
            });

          console.log(
            `[${roundName}] playerMediaStatus : 모든 유저 카메라 마이크 켬`
          );
          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          console.log(`${roundName} 종료`);
          roundName = "r2-2";
        } else if (roundName == "r2-2") {
          console.log(`${roundName} 시작`);
          time = 1; //FIXME - 3초

          voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
          mostVoteResult = getMostVotedPlayer(voteBoard); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)
          const mostVotedPlayer = mostVoteResult.result;
          //await resetVote(roomId); //NOTE - 플레이어들이 한 투표 기록 리셋, 테스트용으로 잠시 주석처리

          let playerToKill = null;
          let playerToSave = null;
          let killedPlayer = null;

          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived == true)
            .filter((player) => player.role === "마피아")
            .map((player) => player.user_id);

          const doctorPlayer = allPlayers
            .filter((player) => player.is_lived == true)
            .find((player) => player.role === "의사")
            .map((player) => player.user_id);

          if (mostVotedPlayer.voted_count !== 0) {
            playerToKill = mostVotedPlayer.user_id;
          }
          playerToSave = await getSelectedPlayer(roomId, "의사");

          if (playerToKill !== playerToSave) {
            if (mafiaPlayers) {
              killedPlayer = await killPlayer(playerToKill);
            }

            if (doctorPlayer) {
              await savePlayer(playerToSave);
            }
          }

          allPlayers = await getPlayersInRoom(roomId);
          killedPlayer = allPlayers.find(
            (player) => player.user_id === killedPlayer
          );

          if (killedPlayer) {
            console.log(
              `[${roundName}] : ${mostVotedPlayer.nickname}님이 죽었습니다. / 3초`
            );
            mafiaIo
              .to(roomId)
              .emit(
                "showModal",
                `${mostVotedPlayer.nickname}님이 죽었습니다.`,
                time
              );

            const winResult = whoWins(allPlayers);
            if (winResult.isValid) {
              if (winResult.result === "시민") {
                console.log(`[${roundName}] victoryPlayer : citizen / 5초`);
                mafiaIo.to(roomId).emit("victoryPlayer", "citizen", 5);
              } else if (winResult.result === "마피아") {
                console.log(`[${roundName}] victoryPlayer : mafia / 5초`);
                mafiaIo.to(roomId).emit("victoryPlayer", "mafia", 5);
              }
              roundName = "r1-0"; //FIXME - 게임 초기화
            }
          } else {
            console.log(
              `[${roundName}] : ${mostVotedPlayer.nickname}님이 의사의 활약으로 아무도 죽지 않았습니다. / 3초 (마피아 유저에게)`
            );
            mafiaPlayers.forEach((player) => {
              mafiaIo
                .to(player)
                .emit(
                  "showModal",
                  `${mostVotedPlayer.nickname}님이 의사의 활약으로 아무도 죽지 않았습니다.`,
                  time
                );
            });

            console.log(
              `[${roundName}] : 의사의 활약으로 아무도 죽지 않았습니다. / 3초 (마피아가 아닌 유저에게)`
            );
            allPlayers
              .filter((player) => player.role !== "마피아")
              .map((player) => player.user_id)
              .forEach((player) => {
                mafiaIo
                  .to(player)
                  .emit(
                    "showModal",
                    `${mostVotedPlayer.nickname}님이 의사의 활약으로 아무도 죽지 않았습니다.`,
                    time
                  );
              });
          }

          console.log(`${roundName} 종료`);
          roundName = "r1-0";
        }
      }
    }, 1000);
  });

  socket.on("voteTo", async (votedPlayer) => {
    console.log("voteTo 시작");

    try {
      await voteTo(votedPlayer, new Date());
      console.log(`${userId}는 ${votedPlayer}에게 투표`);
    } catch (error) {
      console.log("[voteToMafiaError]");
      socket.emit("voteToMafiaError");
      return;
    }
    console.log("voteToMafia 종료");
  });

  socket.on("VoteYesOrNo", async (yesOrNo) => {
    console.log("voteYesOrNo 시작");
    const userId = socket.data.userId;

    try {
      await voteYesOrNo(userId, yesOrNo);
      console.log(`${userId}가 ${yesOrNo} 투표를 함`);
    } catch (error) {
      console.log("[voteYesOrNoError]");
      socket.emit("voteYesOrNoError");
      return;
    }
    console.log("voteYesOrNo 종료");
  });

  socket.on("selectPlayer", async (selectedPlayer) => {
    console.log("selectPlayer 시작");

    try {
      await selectPlayer(selectedPlayer);
      console.log(`${votedPlayer}가 의사의 선택을 받음`);
    } catch (error) {
      console.log("[selectPlayerError]");
      socket.emit("selectPlayerError");
      return;
    }
    console.log("selectPlayer 종료");
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
