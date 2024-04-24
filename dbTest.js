import {
  getCurrentUserDisplay,
  getRoleMaxCount,
} from "./api/supabase/gamePlayAPI.js";
import { getUserIdInRoom } from "./api/supabase/roomAPI.js";

try {
  const result = await getCurrentUserDisplay(
    "0ed9a099-f1b4-46eb-a187-2da752eed29c"
  );
  console.log(result);
} catch (error) {
  console.log("에러");
}
