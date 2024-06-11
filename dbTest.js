import { decideChief } from "./api/supabase/roomAPI.js";

try {
  const data = await decideChief("0ed9a099-f1b4-46eb-a187-2da752eed29c");
  console.log(data);
} catch (error) {
  console.log(error);
}
