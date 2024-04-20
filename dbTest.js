import { setStatus } from "./api/supabse/gamePlayAPI.js";
import { getUserIdInRoom } from "./api/supabse/roomAPI.js";

try {
  const result = await setStatus("11111111-f1b4-46eb-a187-2da752eed29c", {
    r0NightStart: true,
  });
  console.log(result);
} catch (error) {
  console.log("에러");
}
