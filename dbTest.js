import {
  getCurrentUserDisplay,
  getRoleMaxCount,
  resetPlayerStatus,
  resetRoundR0,
  resetRoundR1,
  resetRoundR2,
  setStatus,
} from "./api/supabase/gamePlayAPI.js";
import { getUserIdInRoom } from "./api/supabase/roomAPI.js";

try {
  await setStatus(
    "11111111-f1b4-46eb-a187-2da752eed29c",
    "0ed9a099-f1b4-46eb-a187-2da752eed29c",
    "r0NightStart"
  );
} catch (error) {
  console.log(error);
}
