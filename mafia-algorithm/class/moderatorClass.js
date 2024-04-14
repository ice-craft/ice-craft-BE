import * as gamePlayDB from "../../api/supabse/gamePlayAPI.js";
import * as roomDB from "../../api/supabse/roomAPI.js";

export class Moderator {
  constructor(playerCount, mafiaIo) {
    this.mafiaIo = mafiaIo;
    this.players = [];
    this.playerCount = playerCount;
    this.roles = {};

    switch (this.playerCount) {
      case 5:
        this.roomComposition = {
          mafiaCount: 1,
          citizenCount: 4,
          policeCount: 0,
          doctorCount: 0,
        };
        break;
      case 6:
        this.roomComposition = {
          mafiaCount: 2,
          citizenCount: 3,
          policeCount: 1,
          doctorCount: 0,
        };
        break;
      case 7:
        this.roomComposition = {
          mafiaCount: 2,
          citizenCount: 4,
          policeCount: 1,
          doctorCount: 0,
        };
        break;
      case 8:
        this.roomComposition = {
          mafiaCount: 3,
          citizenCount: 3,
          policeCount: 1,
          doctorCount: 1,
        };
        break;
      case 9:
        this.roomComposition = {
          mafiaCount: 3,
          citizenCount: 4,
          policeCount: 1,
          doctorCount: 1,
        };
        break;
      case 10:
        this.roomComposition = {
          mafiaCount: 3,
          citizenCount: 4,
          policeCount: 1,
          doctorCount: 1,
        };
        break;
    }
  }

  //NOTE - 인원 수 맞는지 확인
  async checkPlayerCountEnough(roomId, totalUserCount) {
    const result = await gamePlayDB.checkPlayerCountEnough(
      roomId,
      totalUserCount
    );

    return result;
  }

  //NOTE - 모든 플레이어들이 전부 레디했는지 확인
  async checkAllPlayersReady(roomId, totalUserCount) {
    const result = await gamePlayDB.checkAllPlayersReady(
      roomId,
      totalUserCount
    );

    return result;
  }

  //NOTE - 게임이 시작가능한 지 확인
  canGameStart(isEnoughCount, isAllReady) {
    return isEnoughCount && isAllReady;
  }

  //NOTE - 방안의 모든 유저들의 정보 반환
  async getAllUserInfo(roomId) {
    const users = await roomDB.getUserInfoInRoom(roomId);
    return users;
  }

  //NOTE - 클라이언트의 화면에 모달창을 띄움
  showModal(roomName, title, message, timer, nickname, yesOrNo) {
    this.mafiaIo.emit("showModal", title, message, timer, nickname, yesOrNo); //NOTE - 테스트 코드라서 .to(roomName) 제외
    this.waitForMs(timer);
  }

  waitForMs(ms) {
    const startTime = Date.now();

    while (Date.now() - startTime < ms) {}
  }

  //NOTE - 사회자가 플레이어의 카메라를 켬
  turnOnCamera(roomName, clientPlayer) {
    this.mafiaIo.emit("setCamera", clientPlayer, true); //NOTE - 테스트 코드라서 .to(roomName) 제외
  }

  //NOTE - 사회자가 플레이어의 카메라를 끔
  turnOffCamera(roomName, clientPlayer) {
    this.mafiaIo.emit("setCamera", clientPlayer, false); //NOTE - 테스트 코드라서 .to(roomName) 제외
  }

  //NOTE - 사회자가 플레이어의 마이크를 켬
  turnOnMike(roomName, clientPlayer) {
    this.mafiaIo.emit("setMike", clientPlayer, true); //NOTE - 테스트 코드라서 .to(roomName) 제외
  }

  //NOTE - 사회자가 플레이어의 마이크를 끔
  turnOffMike(roomName, clientPlayer) {
    this.mafiaIo.emit("setMike", clientPlayer, false); //NOTE - 테스트 코드라서 .to(roomName) 제외
  }

  //NOTE - 플레이어에게 역할 배정
  async setPlayerRole(player, role) {
    await gamePlayDB.setPlayerRole(player.userId, role);
  }

  //NOTE - 각 역할의 플레이어들 반환
  async getPlayerByRole(roomId, role) {
    const players = await gamePlayDB.getPlayerByRole(roomId, role);
    return players;
  }

  //NOTE - 플레이어에게 다른 플레이어의 역할 공개
  openPlayerRole(clientUserId, roleUserId, role) {
    this.mafiaIo.emit("openPlayerRole", roleUserId, role); //NOTE - 테스트 코드라서 to(clientUserId) 제외
  }

  //NOTE - 게임 시작
  gameStart() {
    console.log("게임이 시작되었습니다.");
  }

  //NOTE - 게임 끝
  gameOver() {
    console.log("게임이 종료되었습니다.");
  }

  startTimer(seconds) {
    console.log("타이머 시작");
    if (seconds >= 60) {
      console.log(`${Math.floor(seconds / 60)}분 ${seconds % 60}초 재는 중`);
    } else {
      console.log(`${seconds % 60}초 재는 중`);
    }
    console.log("타이머 종료");
  }

  //NOTE - 라운드 시작
  roundStart() {
    console.log("라운드가 시작되었습니다.");
  }

  //NOTE - 라운드 종료
  roundOver() {
    console.log("라운드가 종료되었습니다.");
  }

  //NOTE - 밤 시작
  nightStart() {
    console.log("밤이 되었습니다.");
  }

  //NOTE - 밤 종료
  nightOver() {
    console.log("밤이 끝났습니다.");
  }

  //NOTE - 아침 시작
  morningStart() {
    console.log("아침이 되었습니다.");
  }

  //NOTE - 아침 종료
  morningOver() {
    console.log("아침이 끝났습니다.");
  }

  //NOTE - 플레이어 죽임
  async killPlayer(userId) {
    const result = await gamePlayDB.killPlayer(userId);

    return result;
  }

  //NOTE - 투표 리셋
  async resetVote(roomId) {
    await gamePlayDB.resetVote(roomId);
  }

  //NOTE - 플레이어들이 받은 표 확인
  async getPlayersVoteResult(roomId) {
    const result = await gamePlayDB.getVoteToResult(roomId);
    return result;
  }

  //NOTE - 표를 가장 많이 받은 플레이어 확인
  getMostVotedPlayer(voteBoard) {
    let isValid;

    isValid = voteBoard[0].voted_count !== voteBoard[1].voted_count;

    return { isValid, result: voteBoard[0] };
  }

  //NOTE - 찬성 반대 투표 결과
  async getYesOrNoVoteResult(roomId) {
    const votes = await gamePlayDB.getVoteYesOrNoResult(roomId);
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
  }

  //NOTE - 유저들에게 마피아 지목 투표 결과 보여줌
  showVoteToResult(roomId, voteBoard) {
    this.mafiaIo.emit("showVoteToResult", voteBoard); //NOTE - 테스트 코드라서 .to(roomId) 제외
  }

  //NOTE - 유저들에게 찬성/반대 투표 결과 보여줌
  showVoteYesOrNoResult(roomId, voteResult) {
    this.mafiaIo.emit("showVoteYesOrNoResult", voteResult); //NOTE - 테스트 코드라서 .to(roomName) 제외
  }

  //NOTE - 역할에 해당하는 유저들의 아이디를 반환
  async checkChosenPlayer(roomId, role) {
    const result = gamePlayDB.checkChosenPlayer(roomId, role);
    return result;
  }

  //NOTE - 유저를 살림
  async savePlayer(userId) {
    const result = gamePlayDB.savePlayer(userId);
    return result;
  }

  //NOTE - 유저가 살았는지 확인
  async checkPlayerLived(userId) {
    const result = gamePlayDB.checkPlayerLived(userId);
    return result;
  }

  //NOTE - 사회자가 특정 유저에게 진행 상황 말함
  speak(player, line) {
    console.log(`사회자[to : ${player.userNickname}] : ${line}`);
  }

  //NOTE - 참가자들 랜덤으로 섞기(피셔-예이츠 셔플 알고리즘)
  shufflePlayers() {
    for (let i = this.players.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); //NOTE - math.random() 대체제 생각해보기
      [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
    }
  }

  //NOTE - 게임을 진행하면서 각 역할을 누가 맡았는지 객체에 저장
  setRoles = () => {
    Object.keys(this.roles).forEach((key) => delete this.roles[key]);

    this.players.forEach((player) => {
      if (player.role === "마피아" || player.role === "시민") {
        if (this.roles[player.role] === undefined) {
          this.roles[player.role] = [];
        }
        if (player.isLived) {
          this.roles[player.role].push(player);
        }
      } else {
        this.roles[player.role] = player;
      }
    });
  };

  //NOTE - 어느 팀이 이겼는지 결과 반환
  whoWins(roles) {
    const mafiaCount = roles["마피아"].length;
    const citizenCount = roles["시민"].length;

    if (mafiaCount === 0) {
      return { isValid: true, result: "시민" };
    }
    if (mafiaCount > citizenCount || mafiaCount === citizenCount) {
      return { isValid: true, result: "마피아" };
    }

    return { isValid: false };
  }
}
