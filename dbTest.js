import { VoteTo, setReady } from "./api/supabse/gamePlayAPI.js";
import { fastJoinRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await VoteTo(
    "49ff90b6-c8ed-46fc-9d18-205e18273f7f",
    "9875abea-190f-4a65-b7af-76a898239484"
  );
} catch (error) {
  throw new Error("에러 발생");
}
