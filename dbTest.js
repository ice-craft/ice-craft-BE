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
import { getUserIdInRoom, isChiefExisted } from "./api/supabase/roomAPI.js";

try {
  const data = await isChiefExisted("0ed9a099-f1b4-46eb-a187-2da752eed29c");
  console.log(data);
} catch (error) {
  console.log(error);
}
