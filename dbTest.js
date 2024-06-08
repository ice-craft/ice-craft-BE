import {
  getCurrentUserDisplay,
  getPlayersInRoom,
  getRoleMaxCount,
  getRound,
  resetPlayerStatus,
  resetRoundR0,
  resetRoundR1,
  resetRoundR2,
  setStatus,
  updateRound,
} from "./api/supabase/gamePlayAPI.js";
import {
  getUserIdInRoom,
  isChiefExisted,
  setChief,
} from "./api/supabase/roomAPI.js";

try {
  const data = await setChief(
    "0ed9a099-f1b4-46eb-a187-2da752eed29c",
    "0ed9a099-f1b4-46eb-a187-2da752eed29b"
  );
  console.log(data);
} catch (error) {
  console.log(error);
}
