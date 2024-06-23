import { getMostVotedPlayer } from "./api/socket/moderatorAPI.js";
import {
  getVoteToResult,
  getVoteYesOrNoResult,
  setReady,
} from "./api/supabase/gamePlayAPI.js";
import {
  decideChief,
  getChief,
  getRoomIsPlaying,
  getRooms,
  setRoomIsPlaying,
} from "./api/supabase/roomAPI.js";

try {
  const joinable = await setRoomIsPlaying(
    "0ed9a099-f1b4-46eb-a187-2da752eed29c",
    false
  );
  console.log(joinable);
} catch (error) {
  console.log(error.message);
}
