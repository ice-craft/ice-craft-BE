import {
  checkChosenPlayer,
  choosePlayer,
  getVoteYesOrNoResult,
  resetChosenPlayer,
  resetVote,
  setReady,
  voteYesOrNo,
} from "./api/supabse/gamePlayAPI.js";
import { fastJoinRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await resetChosenPlayer(
    "12dc28ad-4764-460f-9a54-58c31fdacd1f"
  );
  console.log(result);
} catch (error) {
  console.log("에러");
}
