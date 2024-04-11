import {
  getVoteResult,
  resetVote,
  setReady,
  voteYesOrNo,
} from "./api/supabse/gamePlayAPI.js";
import { fastJoinRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await voteYesOrNo(
    "a38e5be5-423d-4f14-9675-b6598df96c9d",
    "no"
  );
  console.log(result);
} catch (error) {
  console.log(error.message);
}
