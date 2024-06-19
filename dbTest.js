import { setReady } from "./api/supabase/gamePlayAPI.js";
import { decideChief, getChief, getRooms } from "./api/supabase/roomAPI.js";

try {
  const data = await getRooms(0, 20);
  console.log(data);
} catch (error) {
  console.log(error.message);
}
