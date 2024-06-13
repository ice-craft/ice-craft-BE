import { decideChief, getRooms } from "./api/supabase/roomAPI.js";

try {
  const data = await getRooms(-1);
  console.log(data);
} catch (error) {
  console.log(error.message);
}
