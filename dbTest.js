import {
  checkAllPlayersReady,
  getPlayerByRole,
  getRoleCount,
  setPlayerRole,
} from "./api/supabse/gamePlayAPI.js";

try {
  const result = await getPlayerByRole(
    "12dc28ad-4764-460f-9a54-58c31fdacd1f",
    "시민"
  );
  console.log(result);
} catch (error) {
  console.log("에러");
}
