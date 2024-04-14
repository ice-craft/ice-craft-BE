import {
  checkAllPlayersReady,
  getPlayerByRole,
  getRoleCount,
  getVoteToResult,
  getVoteYesOrNoResult,
  setPlayerRole,
} from "./api/supabse/gamePlayAPI.js";

try {
  const result = await getVoteYesOrNoResult(
    "12dc28ad-4764-460f-9a54-58c31fdacd1f"
  );
  console.log(result);
} catch (error) {
  console.log("에러");
}
