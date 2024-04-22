import { getRoleMaxCount } from "./api/supabase/gamePlayAPI.js";
import { getUserIdInRoom } from "./api/supabase/roomAPI.js";

try {
  const result = await getRoleMaxCount(5, "mafia_count");
  console.log(result);
} catch (error) {
  console.log("에러");
}
