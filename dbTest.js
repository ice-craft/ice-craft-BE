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
  for (let i = 0; i < 10; i++) {
    await voteTo("33333333-f1b4-46eb-a187-2da752eed29c");
  }
} catch (error) {
  console.log(error.message);
}
