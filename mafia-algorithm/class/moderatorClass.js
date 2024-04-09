export class Moderator {
  constructor(playerCount) {
    this.players = [];
    this.playerCount = playerCount;
    this.roles = {};

    switch (this.playerCount) {
      case 5:
        this.roomComposition = { mafiaCount: 1, citizenCount: 4, policeCount: 0, doctorCount: 0 };
      case 6:
        this.roomComposition = { mafiaCount: 2, citizenCount: 3, policeCount: 1, doctorCount: 0 };
      case 7:
        this.roomComposition = { mafiaCount: 2, citizenCount: 4, policeCount: 1, doctorCount: 0 };
      case 8:
        this.roomComposition = { mafiaCount: 3, citizenCount: 3, policeCount: 1, doctorCount: 1 };
      case 9:
        this.roomComposition = { mafiaCount: 3, citizenCount: 4, policeCount: 1, doctorCount: 1 };
      case 10:
        this.roomComposition = { mafiaCount: 3, citizenCount: 4, policeCount: 1, doctorCount: 1 };
    }
  }

  //NOTE - 인원 수 맞는지 확인
  checkPlayerCountEnough() {
    return this.players.length === this.playerCount;
  }

  //NOTE - 모든 플레이어들이 전부 레디했는지 확인
  checkAllPlayersReady() {
    let result = true;
    this.players.forEach((player) => {
      if (player.isReady === false) {
        result = false;
      }
    });

    return result;
  }

  //NOTE - 게임이 시작가능한 지 확인
  canGameStart(isEnoughCount, isAllReady) {
    return isEnoughCount && isAllReady;
  }

  //NOTE - 플레이어에게 다른 플레이어의 역할 공개
  openPlayerRole(clientPlayer, rolePlayer, roleName) {
    console.log(`${clientPlayer.userNickname} 클라이언트, ${rolePlayer.userNickname}의 역할은 ${roleName}입니다.`);
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

  //NOTE - 플레이어 죽임,setRoles 따로 처리하기
  killPlayer(player) {
    player.isLived = false;

    return player;
  }

  //NOTE - 투표 리셋
  resetVote() {
    this.players.forEach((player) => {
      player.votedCount = 0;
      player.voteTo = null;
    });
  }

  //NOTE - 플레이어들이 받은 표 확인
  getPlayersVoteResult = () => {
    const voteResult = {};
    this.players.forEach((player) => {
      voteResult[player.userNickname] = player.votedCount;
    });
    return voteResult;
  };

  //NOTE - 표를 가장 많이 받은 플레이어 확인
  getMostVotedPlayer() {
    let sortedResult = [...this.players];
    let isValid;

    sortedResult.sort((a, b) => b.votedCount - a.votedCount);
    isValid = sortedResult[0].votedCount !== sortedResult[1].votedCount;

    return { isValid, result: sortedResult[0] };
  }

  //NOTE - 찬성 반대 투표 결과
  getYesOrNoVoteResult(votes) {
    let yesCount = 0;
    let noCount = 0;
    let isValid;

    votes.forEach((vote) => {
      if (vote === true) {
        yesCount++;
      } else {
        noCount++;
      }
    });

    isValid = yesCount !== noCount;

    return {
      isValid,
      result: yesCount > noCount,
      detail: { yesCount, noCount }
    };
  }

  //NOTE - 유저들에게 투표 결과 보여줌
  showVoteResult(vote) {
    this.players.forEach((player) => console.log(`사회자[to : ${player.userNickname}] : ${vote}`));
  }

  //NOTE - 유저가 살았는지 확인
  checkPlayerLived(player) {
    return player.isLived === true;
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

  //NOTE - 사회자가 플레이어의 카메라를 켬
  turnOnCamera(clientPlayer, cameraPlayer) {
    console.log(`${clientPlayer.userNickname} 클라이언트의 ${cameraPlayer.userNickname} 카메라 켬`);
  }

  //NOTE - 사회자가 플레이어의 카메라를 끔
  turnOffCamera(clientPlayer, cameraPlayer) {
    console.log(`${clientPlayer.userNickname} 클라이언트의 ${cameraPlayer.userNickname} 카메라 끔`);
  }

  //NOTE - 사회자가 플레이어의 마이크를 켬
  turnOnMike(clientPlayer, mikePlayer) {
    console.log(`${clientPlayer.userNickname} 클라이언트의 ${mikePlayer.userNickname} 마이크 켬`);
  }

  //NOTE - 사회자가 플레이어의 마이크를 끔
  turnOffMike(clientPlayer, mikePlayer) {
    console.log(`${clientPlayer.userNickname} 클라이언트의 ${mikePlayer.userNickname} 마이크 끔`);
  }

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
