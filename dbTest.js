import {
  checkAllPlayersReady,
  getRoleCount,
  setPlayerRole,
} from "./api/supabse/gamePlayAPI.js";

try {
  const result = await setPlayerRole(
    "11143912-e9c4-4658-987c-6715bebb1224",
    "의사"
  );
  console.log(result);
} catch (error) {
  console.log("에러");
}
