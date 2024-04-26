import {
  getCurrentUserDisplay,
  getRoleMaxCount,
  resetPlayerStatus,
  resetRoundR0,
  resetRoundR1,
  resetRoundR2,
} from "./api/supabase/gamePlayAPI.js";
import { getUserIdInRoom } from "./api/supabase/roomAPI.js";

try {
  await resetPlayerStatus("0ed9a099-f1b4-46eb-a187-2da752eed29c");
} catch (error) {
  console.log("에러");
}
