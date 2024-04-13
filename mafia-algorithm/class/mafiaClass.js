import { Citizen } from "./citizenClass.js";

export class Mafia extends Citizen {
  constructor(citizen) {
    super(citizen.userId, citizen.userNickname, citizen.index);
    this.role = "마피아";
  }

  //NOTE - 플레이어 죽임
  killPlayer(player) {
    player.isLived = false;

    return player;
  }

  //NOTE - 죽일 플레이어 선택
  choosePlayer(player) {
    return player;
  }
}
