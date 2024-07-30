import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { voteTo } from "src/api/supabase/gamePlayAPI";

export const onVoteTo = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("voteTo", async (votedPlayer) => {
    console.log(`[voteTo] 투표 대상 : ${votedPlayer}`);

    try {
      await voteTo(votedPlayer, new Date());
    } catch (error) {
      console.log(`[voteToError] ${(error as Error).message}`);
      socket.emit("voteToError", (error as Error).message);
    }
  });
};
