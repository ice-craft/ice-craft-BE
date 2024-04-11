import {
  getVoteResult,
  resetVote,
  setReady,
} from "./api/supabse/gamePlayAPI.js";
import { fastJoinRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await getVoteResult("63a68d95-8ecf-440a-ba06-37a493d8252f");
  console.log(result);
} catch (error) {
  console.log(error.message);
}
