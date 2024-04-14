import {
  checkAllPlayersReady,
  checkPlayerLived,
  getPlayerByRole,
  getRoleCount,
  getVoteToResult,
  getVoteYesOrNoResult,
  killPlayer,
  savePlayer,
  setPlayerRole,
} from "./api/supabse/gamePlayAPI.js";
import { getUserIdInRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await getUserIdInRoom("12dc28ad-4764-460f-9a54-58c31fdacd1f");
  console.log(result);
} catch (error) {
  console.log("에러");
}
