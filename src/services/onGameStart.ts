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
  AllPlayer,
  Media,
  RoundStatus,
  VoteBoard,
  YesOrNoVoteResult,
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
    mafiaIo.to(roomId).emit("gameStart");

    const roundStatus: RoundStatus = { INIT: "init", GAME_END: "gameEnd" };

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

    let roundName = roundStatus.INIT;
    let allPlayers = null;

    let mafiaMaxCount = null;
    let doctorMaxCount: number | null = null;
    let policeMaxCount: number | null = null;

    let voteBoard: VoteBoard[] | null = null;
    let mostVoteResult: {
      isValid: boolean;
      result: VoteBoard | AllPlayer;
    } | null = null;
    let yesOrNoVoteResult: YesOrNoVoteResult | null = null;

    let time = 1;

    const start = setInterval(async () => {
      time--;

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
          );
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
            mafiaIo
              .to(roomId)
              .emit("playError", roundName, (error as Error).message);
            clearInterval(start);
          }
        }

        if (roundName === roundStatus.R0_0) {
          time = 1;

          let media: Media = {};
          allPlayers.forEach((player) => {
            media[player.user_id] = { camera: false, mike: false };
          });

          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          roundName = roundStatus.R0_1;
        } else if (roundName === roundStatus.R0_1) {
          time = 3;

          mafiaIo.to(roomId).emit("showModal", "밤이 되었습니다.", time);

          roundName = roundStatus.R0_2;
        } else if (roundName === roundStatus.R0_2) {
          time = 10;

          let playersUserId = allPlayers.map((player) => player.user_id);
          [mafiaMaxCount, policeMaxCount, doctorMaxCount] =
            getRoleMaxCount(playersMaxCount);

          let mafiaPlayers = null;
          let doctorPlayer = null;
          let policePlayer = null;
          let citizenPlayers = null;

          playersUserId = shufflePlayers(playersUserId);

          try {
            for (
              let playerIndex = 0;
              playerIndex < playersMaxCount;
              playerIndex++
            ) {
              await setPlayerRole(playersUserId[playerIndex], "시민");
            }

            for (
              let playerIndex = 0;
              playerIndex < mafiaMaxCount;
              playerIndex++
            ) {
              await setPlayerRole(playersUserId[playerIndex], "마피아");
            }

            if (doctorMaxCount !== 0) {
              await setPlayerRole(playersUserId[mafiaMaxCount], "의사");
            }

            if (policeMaxCount !== 0) {
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

          mafiaIo.to(roomId).emit("showAllPlayerRole", role, time);

          roundName = roundStatus.R0_3;
        } else if (roundName === roundStatus.R0_3) {
          time = 3;

          mafiaIo
            .to(roomId)
            .emit(
              "showModal",
              "마피아들은 고개를 들어 서로를 확인해주세요.",
              time
            );

          roundName = roundStatus.R0_4;
        } else if (roundName === roundStatus.R0_4) {
          time = 1;

          let media: Media = {};
          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived == true)
            .filter((player) => player.role == "마피아")
            .map((player) => player.user_id);

          mafiaPlayers.forEach(
            (userId) => (media[userId] = { camera: true, mike: false })
          );

          mafiaPlayers.forEach((userId) => {
            mafiaIo.to(userId).emit("playerMediaStatus", media);
          });

          roundName = roundStatus.R0_5;
        } else if (roundName == roundStatus.R0_5) {
          time = 5;

          mafiaIo.to(roomId).emit("timerStatus", time);

          roundName = roundStatus.R0_6;
        } else if (roundName === roundStatus.R0_6) {
          time = 1;

          let media: Media = {};
          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived == true)
            .filter((player) => player.role == "마피아")
            .map((player) => player.user_id);

          mafiaPlayers.forEach(
            (userId) => (media[userId] = { camera: false, mike: false })
          );

          mafiaPlayers.forEach((userId) => {
            mafiaIo.to(userId).emit("playerMediaStatus", media);
          });

          roundName = roundStatus.R1_0;
        } else if (roundName == roundStatus.R1_0) {
          time = 3;

          mafiaIo
            .to(roomId)
            .emit(
              "showModal",
              "아침이 되었습니다. 모든 유저는 토론을 통해 마피아를 찾아내세요.",
              time
            );

          roundName = roundStatus.R1_1;
        } else if (roundName == roundStatus.R1_1) {
          time = 1;

          let media: Media = {};
          allPlayers
            .filter((player) => player.is_lived == true)
            .forEach((player) => {
              media[player.user_id] = { camera: true, mike: true };
            });

          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          roundName = roundStatus.R1_2;
        } else if (roundName == roundStatus.R1_2) {
          time = 60;

          mafiaIo.to(roomId).emit("timerStatus", time);

          roundName = roundStatus.R1_3;
        } else if (roundName == roundStatus.R1_3) {
          time = 1;

          let media: Media = {};
          allPlayers
            .filter((player) => player.is_lived == true)
            .forEach((player) => {
              media[player.user_id] = { camera: true, mike: false };
            });

          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          roundName = roundStatus.R1_4;
        } else if (roundName == roundStatus.R1_4) {
          time = 3;

          mafiaIo
            .to(roomId)
            .emit(
              "showModal",
              "토론이 끝났습니다. 마피아일 것 같은 사람의 화면을 클릭하세요.",
              time
            );

          roundName = roundStatus.R1_5;
        } else if (roundName == roundStatus.R1_5) {
          time = 10;

          mafiaIo.to(roomId).emit("inSelect", "vote", time);

          roundName = roundStatus.R1_6;
        } else if (roundName == roundStatus.R1_6) {
          time = 5;
          try {
            voteBoard = await getVoteToResult(roomId);
            await resetVote(roomId);
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

          mafiaIo.to(roomId).emit("showVoteResult", voteBoard, time);

          roundName = roundStatus.R1_7;
        } else if (roundName == roundStatus.R1_7) {
          time = 3;

          if (voteBoard) {
            mostVoteResult = getMostVotedPlayer(voteBoard, false);

            if (mostVoteResult && mostVoteResult.isValid) {
              mafiaIo
                .to(roomId)
                .emit(
                  "showModal",
                  `${mostVoteResult.result.user_nickname}님은 최후의 변론을 시작하세요.`,
                  time
                );

              roundName = roundStatus.R1_8;
            } else {
              if (mostVoteResult) {
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

              roundName = roundStatus.R1_13;
            }
          }
        } else if (roundName == roundStatus.R1_8) {
          time = 1;
          if (mostVoteResult) {
            let media: Media = {};
            allPlayers
              .filter(
                (player) => player.user_id === mostVoteResult!.result.user_id
              )
              .forEach((player) => {
                media[player.user_id] = { camera: true, mike: true };
              });

            mafiaIo.to(roomId).emit("playerMediaStatus", media);
          }

          roundName = roundStatus.R1_9;
        } else if (roundName == roundStatus.R1_9) {
          time = 10;

          mafiaIo.to(roomId).emit("timerStatus", time);

          roundName = roundStatus.R1_10;
        } else if (roundName == roundStatus.R1_10) {
          time = 1;

          if (mostVoteResult) {
            let media: Media = {};
            allPlayers
              .filter(
                (player) => player.user_id === mostVoteResult!.result.user_id
              )
              .forEach((player) => {
                media[player.user_id] = { camera: true, mike: false };
              });

            mafiaIo.to(roomId).emit("playerMediaStatus", media);
          }

          roundName = roundStatus.R1_11;
        } else if (roundName == roundStatus.R1_11) {
          time = 10;

          mafiaIo
            .to(roomId)
            .emit("showModal", "찬성/반대 투표를 해주세요.", time);

          roundName = roundStatus.R1_12;
        } else if (roundName == roundStatus.R1_12) {
          time = 5;

          try {
            yesOrNoVoteResult = await getYesOrNoVoteResult(roomId);
            await resetVote(roomId);
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

          mafiaIo
            .to(roomId)
            .emit("showVoteDeadOrLive", yesOrNoVoteResult, time);

          roundName = roundStatus.R1_13;
        } else if (roundName == roundStatus.R1_13) {
          time = 3;

          let killedPlayer: string | null = null;

          if (yesOrNoVoteResult && yesOrNoVoteResult.result) {
            try {
              if (mostVoteResult) {
                killedPlayer = await killPlayer(mostVoteResult.result.user_id);
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

            mafiaIo.to(roomId).emit("diedPlayer", killedPlayer);

            const isPlayerMafia = allPlayers
              .filter((player) => player.role === "마피아")
              .some((player) => player.user_id === killedPlayer);

            if (isPlayerMafia) {
              mafiaIo
                .to(roomId)
                .emit("showModal", "마피아가 죽었습니다.", time);
            } else {
              mafiaIo.to(roomId).emit("showModal", "시민이 죽었습니다.", time);
            }
          } else {
            mafiaIo
              .to(roomId)
              .emit("showModal", "아무도 죽지 않았습니다.", time);
          }

          roundName = roundStatus.R1_14;
        } else if (roundName == roundStatus.R1_14) {
          time = 1;

          let media: Media = {};
          allPlayers.forEach((player) => {
            media[player.user_id] = { camera: false, mike: false };
          });

          mafiaIo.to(roomId).emit("playerMediaStatus", media);

          roundName = roundStatus.R1_15;
        } else if (roundName === roundStatus.R1_15) {
          time = 3;

          mafiaIo
            .to(roomId)
            .emit(
              "showModal",
              "밤이 되었습니다. 마피아는 제스처를 통해 상의 후 누구를 죽일 지 선택해주세요.",
              time
            );

          roundName = roundStatus.R1_16;
        } else if (roundName === roundStatus.R1_16) {
          time = 1;

          let media: Media = {};
          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived === true)
            .filter((player) => player.role === "마피아")
            .map((player) => player.user_id);

          mafiaPlayers.forEach(
            (userId) => (media[userId] = { camera: true, mike: false })
          );

          mafiaPlayers.forEach((userId) => {
            mafiaIo.to(userId).emit("playerMediaStatus", media);
          });

          roundName = roundStatus.R1_17;
        } else if (roundName === roundStatus.R1_17) {
          time = 10;

          mafiaIo.to(roomId).emit("inSelect", "mafia", time);

          roundName = roundStatus.R1_18;
        } else if (roundName === roundStatus.R1_18) {
          time = 1;

          let media: Media = {};
          const mafiaPlayers = allPlayers
            .filter((player) => player.is_lived == true)
            .filter((player) => player.role == "마피아")
            .map((player) => player.user_id);

          mafiaPlayers.forEach(
            (userId) => (media[userId] = { camera: false, mike: false })
          );

          mafiaPlayers.forEach((userId) => {
            mafiaIo.to(userId).emit("playerMediaStatus", media);
          });

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
          time = 3;

          mafiaIo
            .to(roomId)
            .emit("showModal", "의사는 누구를 살릴 지 결정해주세요.", time);

          roundName = roundStatus.R1_20;
        } else if (roundName == roundStatus.R1_20) {
          time = 10;

          mafiaIo.to(roomId).emit("inSelect", "doctor", time);

          if (policeMaxCount && policeMaxCount > 0) {
            roundName = roundStatus.R1_21;
          } else {
            roundName = roundStatus.R2_0;
          }
        } else if (roundName == roundStatus.R1_21) {
          time = 3;

          mafiaIo
            .to(roomId)
            .emit("showModal", "경찰은 마피아 의심자를 결정해주세요.", time);

          roundName = roundStatus.R1_22;
        } else if (roundName == roundStatus.R1_22) {
          time = 10;

          mafiaIo.to(roomId).emit("inSelect", "police", time);

          roundName = roundStatus.R2_0;
        } else if (roundName == roundStatus.R2_0) {
          time = 3;

          let mostVotedPlayer = null;
          let playerToKill = null;
          let playerToSave = null;
          let killedPlayer = null;

          try {
            voteBoard = await getVoteToResult(roomId);
            mostVoteResult = getMostVotedPlayer(voteBoard, true);
            mostVotedPlayer = mostVoteResult!.result;

            await resetVote(roomId);
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
            mafiaIo
              .to(roomId)
              .emit(
                "showModal",
                `${mostVotedPlayer.user_nickname}님이 죽었습니다.`,
                time
              );

            mafiaIo.to(roomId).emit("diedPlayer", killedPlayer);
          } else {
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

          roundName = roundStatus.R1_0;
        }
      }
    }, 1000);
  });
};
