import { getMostVotedPlayer } from "./api/socket/moderatorAPI.js";
import {
  getVoteToResult,
  getVoteYesOrNoResult,
  setReady,
  voteTo,
} from "./api/supabase/gamePlayAPI.js";
import {
  decideChief,
  getChief,
  getRoomInfo,
  getRoomIsPlaying,
  getRooms,
  setRoomIsPlaying,
} from "./api/supabase/roomAPI.js";

try {
  const voteBoard = await getVoteToResult(
    "0ed9a099-f1b4-46eb-a187-2da752eed29c"
  ); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  const mostVoteResult = getMostVotedPlayer(voteBoard, true); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)
} catch (error) {
  console.log(error.message);
}
