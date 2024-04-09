export class Citizen {
  constructor(userId, userNickname) {
    this.userId = userId;
    this.userNickname = userNickname;
    this.isReady = false;
    this.role = "시민";
    this.isLived = true;
    this.voteTo = null;
    this.votedCount = 0;
  }

  //NOTE - 게임 레디하기
  ready(isReady) {
    this.isReady = isReady;
  }

  //NOTE - 플레이어를 선택하는 투표
  voteToPlayer(player) {
    this.voteTo = player;
    player.votedCount++;
  }

  //NOTE - 찬성, 반대를 결정하는 투표
  voteYesOrNo(votes, yesOrNo) {
    votes.push(yesOrNo);
    return votes;
  }
  //NOTE - 방 나가기
  exit() {
    this.isLived = false;
  }
}
