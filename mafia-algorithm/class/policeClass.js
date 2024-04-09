export class Police extends Citizen {
  constructor(citizen) {
    super(citizen.userId, citizen.userNickname, citizen.index);
    this.role = "경찰";
  }

  //NOTE - 경찰이 플레이어가 마피아 인지 알아냄
  checkPlayerMafia(player) {
    if (player.role === "마피아") {
      return true;
    } else {
      return false;
    }
  }
}
