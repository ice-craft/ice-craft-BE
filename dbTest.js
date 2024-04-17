import {
  checkChosenPlayer,
  checkPlayerMafia,
  getPlayerNickname,
} from "./api/supabse/gamePlayAPI.js";
import { getUserIdInRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await checkPlayerMafia("44443912-e9c4-4658-987c-6715bebb1224");
  console.log(result);
} catch (error) {
  console.log("에러");
}
