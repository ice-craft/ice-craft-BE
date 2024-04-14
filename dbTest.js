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

try {
  const result = await checkPlayerLived(
    // "12dc28ad-4764-460f-9a54-58c31fdacd1f",
    "79043912-e9c4-4658-987c-6715bebb1224"
  );
  console.log(result);
} catch (error) {
  console.log("에러");
}
