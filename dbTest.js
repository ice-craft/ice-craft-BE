import {
  getCurrentUserDisplay,
  getRoleMaxCount,
  getRound,
  resetPlayerStatus,
  resetRoundR0,
  resetRoundR1,
  resetRoundR2,
  setStatus,
  updateRound,
} from "./api/supabase/gamePlayAPI.js";
import { getUserIdInRoom } from "./api/supabase/roomAPI.js";

try {
  const data = await updateRound("0ed9a099-f1b4-46eb-a187-2da752eed29c", "r1");
  console.log(data);
} catch (error) {
  console.log(error);
}
