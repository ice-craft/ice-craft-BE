import { setReady } from "./api/supabse/gamePlayAPI.js";
import { fastJoinRoom } from "./api/supabse/roomAPI.js";

const result = await fastJoinRoom(
  "81df5115-d3eb-4d94-a7ce-6aa7d2629f93",
  "user1"
);
console.log(result);
