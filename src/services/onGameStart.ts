import { Namespace, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getRoomInfo, setRoomIsPlaying } from "src/api/supabase/roomAPI";
import {
  gameOver,
  getMostVotedPlayer,
  getRoleMaxCount,
  getYesOrNoVoteResult,
  playError,
  shufflePlayers,
} from "src/api/socket/moderatorAPI";
import {
  allPlayerType,
  mediaType,
  roundStatusType,
  voteBoardType,
  yesOrNoVoteResultType,
} from "types";
import {
  getPlayersInRoom,
  getSelectedPlayer,
  getVoteToResult,
  initGame,
  killPlayer,
  resetSelectedPlayer,
  resetVote,
  savePlayer,
  setPlayerRole,
} from "src/api/supabase/gamePlayAPI";

export const onGameStart = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  mafiaIo: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("gameStart", async (roomId, playersMaxCount) => {
    console.log(`[gameStart] roomId : ${roomId}, 총 인원 : ${playersMaxCount}`);
    mafiaIo.to(roomId).emit("gameStart");

    const roundStatus: roundStatusType = { INIT: "init", GAME_END: "gameEnd" };

    for (let i = 0; i < 7; i++) {
      const key = `R0_${i}`;
      const value = `r0-${i}`;

      roundStatus[key] = value;
    }

    for (let i = 0; i < 23; i++) {
      const key = `R1_${i}`;
      const value = `r1-${i}`;

      roundStatus[key] = value;
    }

    roundStatus["R2_0"] = "r2-0";

    try {
      await setRoomIsPlaying(roomId, true);
      const roomInfo = await getRoomInfo(roomId);
      mafiaIo.emit("updateRoomInfo", roomInfo);
    } catch (error) {
      return await playError(
        "start",
        roomId,
        mafiaIo,
        error as Error,
        null,
        roundStatus
      );
    }

    let roundName = roundStatus.INIT; //FIXME - 테스트용 코드, 실제 배포시에는 init으로 변경
    let allPlayers = null;

    let mafiaMaxCount = null;
    let doctorMaxCount: number | null = null;
    let policeMaxCount: number | null = null;

    let voteBoard: voteBoardType[] | null = null;
    let mostVoteResult: {
      isValid: boolean;
      result: voteBoardType | allPlayerType;
    } | null = null;
    let yesOrNoVoteResult: yesOrNoVoteResultType | null = null;

    let time = 1;

    const start = setInterval(async () => {
      time--; //FIXME - 테스트 코드, 배포할 때는 --로 고치기

      if (time <= 0) {
        try {
          allPlayers = await getPlayersInRoom(roomId);
          roundName = await gameOver(
            mafiaIo,
            roomId,
            roundName,
            allPlayers,
            start,
            roundStatus
          ); //NOTE - 라운드마다 게임 종료 조건 확인
        } catch (error) {
          return await playError(
            roundName,
            roomId,
            mafiaIo,
            error as Error,
            start,
            roundStatus
          );
        }

        if (roundName == roundStatus.INIT) {
          try {
            await initGame(roomId);
            roundName = roundStatus.R0_0;
          } catch (error) {
            console.log(
              `[playError] ${roundName}, ${(error as Error).message}`
            );
            mafiaIo
              .to(roomId)
              .emit("playError", roundName, (error as Error).message);
            clearInterval(start);
          }
        }

        if (roundName === roundStatus.R0_0) {
          console.log(`${roundName} 시작`);
          time = 1;

          let media: mediaType = {};
          allPlayers.forEach((player) => {
            media[player.user_id] = { camera: false, mike: false };
          });

          console.log(
            `[${roundName}] playerMediaStatus : 모든 유저 카메라 마이크 끔`
          );
          console.log(media);
          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R0_1;
        } else if (roundName === roundStatus.R0_1) {
          console.log(`${roundName} 시작`);
          time = 3;

          console.log(`[${roundName}] showModal :  밤이 되었습니다. / 3초`);
          mafiaIo.to(roomId).emit("showModal", "밤이 되었습니다.", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R0_2;
        } else if (roundName === roundStatus.R0_2) {
          console.log(`${roundName} 시작`);
          time = 10;

          let playersUserId = allPlayers.map((player) => player.user_id);
          [mafiaMaxCount, policeMaxCount, doctorMaxCount] =
            getRoleMaxCount(playersMaxCount);

          let mafiaPlayers = null;
          let doctorPlayer = null;
          let policePlayer = null;
          let citizenPlayers = null;

          playersUserId = shufflePlayers(playersUserId);

          console.log("총 플레이어", playersUserId);
          console.log("최대 마피아 인원 수", mafiaMaxCount);
          console.log("최대 의사 인원 수", doctorMaxCount);
          console.log("최대 경찰 인원 수", policeMaxCount);

          try {
            //FIXME - 테스트용 코드, 배포시 삭제
            for (
              let playerIndex = 0;
              playerIndex < playersMaxCount;
              playerIndex++
            ) {
              await setPlayerRole(playersUserId[playerIndex], "시민");
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
          } catch (error) {
            return await playError(
              roundName,
              roomId,
              mafiaIo,
              error as Error,
              start,
              roundStatus
            );
          }

          if (doctorMaxCount > 0) {
            doctorPlayer = allPlayers
              .filter((player) => player.role == "의사")
              .map((player) => player.user_id);
          }

          if (policeMaxCount) {
            policePlayer = allPlayers
              .filter((player) => player.role == "경찰")
              .map((player) => player.user_id);
          }

          citizenPlayers = allPlayers
            .filter((player) => player.role == "시민")
            .map((player) => player.user_id);

          let role: { [key: string]: string[] | null } = {};

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
          roundName = roundStatus.R0_3;
        } else if (roundName === roundStatus.R0_3) {
          console.log(`${roundName} 시작`);
          time = 3;

          console.log(
            `[${roundName}] showModal : 마피아들은 고개를 들어 서로를 확인해주세요. / 3초`
          );
          mafiaIo
            .to(roomId)
            .emit(
              "showModal",
              "마피아들은 고개를 들어 서로를 확인해주세요.",
              time
            );

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R0_4;
        } else if (roundName === roundStatus.R0_4) {
          console.log(`${roundName} 시작`);
          time = 1;

          let media: mediaType = {};
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
          roundName = roundStatus.R0_5;
        } else if (roundName == roundStatus.R0_5) {
          console.log(`${roundName} 시작`);
          time = 5;

          console.log(`[${roundName}] timerStatus / 5초`);
          mafiaIo.to(roomId).emit("timerStatus", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R0_6;
        } else if (roundName === roundStatus.R0_6) {
          console.log(`${roundName} 시작`);
          time = 1;

          let media: mediaType = {};
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
          roundName = roundStatus.R1_0;
        } else if (roundName == roundStatus.R1_0) {
          console.log(`${roundName} 시작`);
          time = 3;

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
          roundName = roundStatus.R1_1;
        } else if (roundName == roundStatus.R1_1) {
          console.log(`${roundName} 시작`);
          time = 1;

          let media: mediaType = {};
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
          roundName = roundStatus.R1_2;
        } else if (roundName == roundStatus.R1_2) {
          console.log(`${roundName} 시작`);
          time = 60;

          console.log(`[${roundName}] timerStatus / 60초`);
          mafiaIo.to(roomId).emit("timerStatus", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_3;
        } else if (roundName == roundStatus.R1_3) {
          console.log(`${roundName} 시작`);
          time = 1;

          let media: mediaType = {};
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
          roundName = roundStatus.R1_4;
        } else if (roundName == roundStatus.R1_4) {
          console.log(`${roundName} 시작`);
          time = 3;

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
          roundName = roundStatus.R1_5;
        } else if (roundName == roundStatus.R1_5) {
          console.log(`${roundName} 시작`);
          time = 10;

          console.log(`[${roundName}] inSelect : vote /  10초`);
          mafiaIo.to(roomId).emit("inSelect", "vote", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_6;
        } else if (roundName == roundStatus.R1_6) {
          console.log(`${roundName} 시작`);
          time = 5;
          try {
            voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
            await resetVote(roomId); //NOTE - 플레이어들이 한 투표 기록 리셋, 테스트용으로 잠시 주석처리
          } catch (error) {
            return await playError(
              roundName,
              roomId,
              mafiaIo,
              error as Error,
              start,
              roundStatus
            );
          }

          console.log(
            `[${roundName}] showVoteResult : 마피아 의심 투표 결과 / 5초`
          );
          console.log(voteBoard);
          mafiaIo.to(roomId).emit("showVoteResult", voteBoard, time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_7;
        } else if (roundName == roundStatus.R1_7) {
          console.log(`${roundName} 시작`);
          time = 3;

          if (voteBoard) {
            mostVoteResult = getMostVotedPlayer(voteBoard, false); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)

            if (mostVoteResult && mostVoteResult.isValid) {
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
              roundName = roundStatus.R1_8;
            } else {
              if (mostVoteResult) {
                console.log(
                  `[${roundName}] showModal : 동률로 인해 임의의 플레이어가 사망합니다. ${mostVoteResult.result.user_nickname} / 3초`
                );
              }

              mafiaIo
                .to(roomId)
                .emit(
                  "showModal",
                  "동률로 인해 임의의 플레이어가 사망합니다.",
                  time
                );
              yesOrNoVoteResult = {
                result: true,
                detail: { yesCount: 0, noCount: 0 },
              };
              console.log(`${roundName} 종료`);
              roundName = roundStatus.R1_13;
            }
          }
        } else if (roundName == roundStatus.R1_8) {
          console.log(`${roundName} 시작`);
          time = 1;
          if (mostVoteResult) {
            let media: mediaType = {};
            allPlayers
              .filter(
                (player) => player.user_id === mostVoteResult!.result.user_id
              )
              .forEach((player) => {
                media[player.user_id] = { camera: true, mike: true };
              });

            console.log(
              `[${roundName}] playerMediaStatus : 최대 투표를 받은 유저 카메라 켬, 마이크 켬`
            );
            console.log(media);
            mafiaIo.to(roomId).emit("playerMediaStatus", media);
          }

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_9;
        } else if (roundName == roundStatus.R1_9) {
          console.log(`${roundName} 시작`);
          time = 10;

          console.log(`[${roundName}] timerStatus : 10초`);
          mafiaIo.to(roomId).emit("timerStatus", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_10;
        } else if (roundName == roundStatus.R1_10) {
          console.log(`${roundName} 시작`);
          time = 1;

          if (mostVoteResult) {
            let media: mediaType = {};
            allPlayers
              .filter(
                (player) => player.user_id === mostVoteResult!.result.user_id
              )
              .forEach((player) => {
                media[player.user_id] = { camera: true, mike: false };
              });

            console.log(
              `[${roundName}] playerMediaStatus : 모든 유저 카메라 켬, 마이크 끔`
            );
            console.log(media);
            mafiaIo.to(roomId).emit("playerMediaStatus", media);
          }

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_11;
        } else if (roundName == roundStatus.R1_11) {
          console.log(`${roundName} 시작`);
          time = 10;

          console.log(
            `[${roundName}] showModal : 찬성/반대 투표를 해주세요. / 10초`
          );
          mafiaIo
            .to(roomId)
            .emit("showModal", "찬성/반대 투표를 해주세요.", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_12;
        } else if (roundName == roundStatus.R1_12) {
          console.log(`${roundName} 시작`);
          time = 5;

          try {
            yesOrNoVoteResult = await getYesOrNoVoteResult(roomId); //NOTE - 찬반 투표 결과 (확정X, 동률 나올 수 있음)
            await resetVote(roomId); //NOTE - 투표 결과 리셋, 테스트 상 주석처리
          } catch (error) {
            return await playError(
              roundName,
              roomId,
              mafiaIo,
              error as Error,
              start,
              roundStatus
            );
          }

          console.log(`[${roundName}] showVoteDeadOrLive / 5초`);
          console.log(yesOrNoVoteResult);
          mafiaIo
            .to(roomId)
            .emit("showVoteDeadOrLive", yesOrNoVoteResult, time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_13;
        } else if (roundName == roundStatus.R1_13) {
          console.log(`${roundName} 시작`);
          time = 3;

          let killedPlayer: string | null = null;

          if (yesOrNoVoteResult && yesOrNoVoteResult.result) {
            console.log("투표 결과 유효함");
            try {
              if (mostVoteResult) {
                killedPlayer = await killPlayer(mostVoteResult.result.user_id); //NOTE - 투표를 가장 많이 받은 플레이어 사망
              }

              allPlayers = await getPlayersInRoom(roomId);
            } catch (error) {
              return await playError(
                roundName,
                roomId,
                mafiaIo,
                error as Error,
                start,
                roundStatus
              );
            }

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
          } else {
            //NOTE - 투표 실패, 동률이 나옴
            console.log(
              `[${roundName}] showModal : 아무도 죽지 않았습니다. / 3초`
            );
            mafiaIo
              .to(roomId)
              .emit("showModal", "아무도 죽지 않았습니다.", time);
          }

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_14;
        } else if (roundName == roundStatus.R1_14) {
          console.log(`${roundName} 시작`);
          time = 1;

          let media: mediaType = {};
          allPlayers.forEach((player) => {
            media[player.user_id] = { camera: false, mike: false };
          });

          console.log(
            `[${roundName}] playerMediaStatus : 모든 유저 카메라 끔, 마이크 끔`
          );
          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_15;
        } else if (roundName === roundStatus.R1_15) {
          console.log(`${roundName} 시작`);
          time = 3;

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
          roundName = roundStatus.R1_16;
        } else if (roundName === roundStatus.R1_16) {
          console.log(`${roundName} 시작`);
          time = 1;

          let media: mediaType = {};
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
          roundName = roundStatus.R1_17;
        } else if (roundName === roundStatus.R1_17) {
          console.log(`${roundName} 시작`);
          time = 10;

          console.log(`[${roundName}] inSelect : mafia /  10초`);
          mafiaIo.to(roomId).emit("inSelect", "mafia", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_18;
        } else if (roundName === roundStatus.R1_18) {
          console.log(`${roundName} 시작`);
          time = 1;

          let media: mediaType = {};
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
          // doctorMaxCount = 0; //FIXME - 테스트 코드
          // policeMaxCount = 0; //FIXME - 테스트 코드
          console.log("의사", doctorMaxCount, "경찰", policeMaxCount); //FIXME - 테스트 코드
          if (doctorMaxCount === 0 && policeMaxCount === 0) {
            roundName = roundStatus.R2_0;
          } else if (
            doctorMaxCount == 0 &&
            policeMaxCount &&
            policeMaxCount > 0
          ) {
            roundName = roundStatus.R1_21;
          } else {
            roundName = roundStatus.R1_19;
          }
        } else if (roundName == roundStatus.R1_19) {
          console.log(`${roundName} 시작`);
          time = 3;

          console.log(
            `[${roundName}] showModal : 의사는 누구를 살릴 지 결정해주세요. / 3초`
          );
          mafiaIo
            .to(roomId)
            .emit("showModal", "의사는 누구를 살릴 지 결정해주세요.", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_20;
        } else if (roundName == roundStatus.R1_20) {
          console.log(`${roundName} 시작`);
          time = 10;

          console.log(`[${roundName}] inSelect : doctor / 10초`);
          mafiaIo.to(roomId).emit("inSelect", "doctor", time);

          console.log(`${roundName} 종료`);
          if (policeMaxCount && policeMaxCount > 0) {
            roundName = roundStatus.R1_21;
          } else {
            roundName = roundStatus.R2_0;
          }
        } else if (roundName == roundStatus.R1_21) {
          console.log(`${roundName} 시작`);
          time = 3;

          console.log(
            `[${roundName}] showModal : 경찰은 마피아 의심자를 결정해주세요. / 3초`
          );
          mafiaIo
            .to(roomId)
            .emit("showModal", "경찰은 마피아 의심자를 결정해주세요.", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_22;
        } else if (roundName == roundStatus.R1_22) {
          console.log(`${roundName} 시작`);
          time = 10;

          console.log(`[${roundName}] inSelect : police / 10초`);
          mafiaIo.to(roomId).emit("inSelect", "police", time);

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R2_0;
        } else if (roundName == roundStatus.R2_0) {
          console.log(`${roundName} 시작`);
          time = 3;

          let mostVotedPlayer = null;
          let playerToKill = null;
          let playerToSave = null;
          let killedPlayer = null;

          try {
            voteBoard = await getVoteToResult(roomId); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
            mostVoteResult = getMostVotedPlayer(voteBoard, true); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)
            mostVotedPlayer = mostVoteResult!.result;
            console.log("투표 당선", mostVotedPlayer); //FIXME - 테스트 코드
            await resetVote(roomId); //NOTE - 플레이어들이 한 투표 기록 리셋, 테스트용으로 잠시 주석처리
          } catch (error) {
            return await playError(
              roundName,
              roomId,
              mafiaIo,
              error as Error,
              start,
              roundStatus
            );
          }

          playerToKill = mostVotedPlayer.user_id;

          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived == true)
            .filter((player) => player.role === "마피아")
            .map((player) => player.user_id);

          let doctorPlayer = null;
          try {
            if (doctorMaxCount && doctorMaxCount > 0) {
              doctorPlayer = allPlayers
                .filter((player) => player.is_lived == true)
                .find((player) => player.role === "의사")?.user_id;

              playerToSave = await getSelectedPlayer(roomId);
            }

            console.log(
              "죽일 플레이어",
              playerToKill,
              "살릴 사람",
              playerToSave
            ); //FIXME - 테스트 코드

            if (playerToKill !== playerToSave) {
              if (mafiaPlayers) {
                killedPlayer = await killPlayer(playerToKill);
              }

              if (doctorPlayer) {
                await savePlayer(playerToSave);
              }
            }

            await resetSelectedPlayer(roomId);
            allPlayers = await getPlayersInRoom(roomId);
          } catch (error) {
            return await playError(
              roundName,
              roomId,
              mafiaIo,
              error as Error,
              start,
              roundStatus
            );
          }

          if (killedPlayer) {
            console.log(
              `[${roundName}] : ${mostVotedPlayer.user_nickname}님이 죽었습니다. / 3초`
            );
            mafiaIo
              .to(roomId)
              .emit(
                "showModal",
                `${mostVotedPlayer.user_nickname}님이 죽었습니다.`,
                time
              );
            console.log("죽은 사람", killedPlayer);
            console.log(`[${roundName}] diedPlayer : ${killedPlayer}`);
            mafiaIo.to(roomId).emit("diedPlayer", killedPlayer);
          } else {
            console.log(
              `[${roundName}] : ${mostVotedPlayer.user_nickname}님이 의사의 활약으로 아무도 죽지 않았습니다. / 3초 (마피아 유저에게)`
            );

            allPlayers
              .filter((player) => player.role === "마피아")
              .map((player) => player.user_id)
              .forEach((player) => {
                mafiaIo
                  .to(player)
                  .emit(
                    "showModal",
                    `${mostVotedPlayer.user_nickname}님이 의사의 활약으로 아무도 죽지 않았습니다.`,
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
                    "의사의 활약으로 아무도 죽지 않았습니다.",
                    time
                  );
              });
          }

          console.log(`${roundName} 종료`);
          roundName = roundStatus.R1_0;
        }
      }
    }, 1000);
  });
};
