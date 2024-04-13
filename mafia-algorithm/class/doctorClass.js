import { Citizen } from "./citizenClass.js";

export class Doctor extends Citizen {
  constructor(citizen) {
    super(citizen.userId, citizen.userNickname, citizen.index);
    this.role = "의사";
  }

  //NOTE - 의사가 플레이어 살림
  savePlayer(player) {
    player.isLived = true;

    return player;
  }

  //NOTE - 살릴 플레이어 선택
  choosePlayer(player) {
    return player;
  }
}
