import {
  getVoteToResult,
  getVoteYesOrNoResult,
  setReady,
} from "./api/supabase/gamePlayAPI.js";
import { decideChief, getChief, getRooms } from "./api/supabase/roomAPI.js";

try {
  const data = await getVoteToResult("0ed9a099-f1b4-46eb-a187-2da752eed29c");
  console.log(data);
} catch (error) {
  console.log(error.message);
}
