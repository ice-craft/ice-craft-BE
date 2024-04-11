import {
  getVoteYesOrNoResult,
  resetVote,
  setReady,
  voteYesOrNo,
} from "./api/supabse/gamePlayAPI.js";
import { fastJoinRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await getVoteYesOrNoResult(
    "ab3a638d-90e5-4965-9b9f-adec7a5bb6df"
  );
  console.log(result);
} catch (error) {
  console.log(error.message);
}
