import { setReady } from "./api/supabase/gamePlayAPI.js";
import { decideChief, getRooms } from "./api/supabase/roomAPI.js";

try {
  await setReady("11111111-f1b4-46eb-a187-2da752eed29c", -1);
} catch (error) {
  console.log(error.message);
}
