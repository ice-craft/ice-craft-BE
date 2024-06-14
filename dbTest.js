import { setReady } from "./api/supabase/gamePlayAPI.js";
import { decideChief, getChief, getRooms } from "./api/supabase/roomAPI.js";

try {
  const data = await getChief("ab726fd9-6196-426c-8d76-064f9c134e11");
  console.log(data);
} catch (error) {
  console.log(error.message);
}
