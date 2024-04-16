import {
  checkAllPlayersReady,
  checkPlayerLived,
  checkPlayerMafia,
  choosePlayer,
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
  const result = await choosePlayer(
    "11143912-e9c4-4658-987c-6715bebb1224",
    "의사"
  );
  console.log(result);
} catch (error) {
  console.log("에러");
}
