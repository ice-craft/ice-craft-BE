import { setReady } from "./api/supabase/gamePlayAPI.js";
import { decideChief, getRooms } from "./api/supabase/roomAPI.js";

try {
  await setReady("11111111-f1b4-46eb-a187-2da752eed29c", true);
} catch (error) {
  console.log(error.message);
}
