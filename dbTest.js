import { checkChosenPlayer } from "./api/supabse/gamePlayAPI.js";
import { getUserIdInRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await checkChosenPlayer(
    "12dc28ad-4764-460f-9a54-58c31fdacd1f",
    "마피아"
  );
  console.log(result);
} catch (error) {
  console.log("에러");
}
