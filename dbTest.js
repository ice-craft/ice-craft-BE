import { resetVote, setReady } from "./api/supabse/gamePlayAPI.js";
import { fastJoinRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await resetVote("cdb148a2-eda3-4a66-8bae-c8090d528d56");
  console.log(result);
} catch (error) {
  console.log(error.message);
}
