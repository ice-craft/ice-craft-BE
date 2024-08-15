import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { voteYesOrNo } from "src/api/supabase/gamePlayAPI";

export const onVoteYesOrNo = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("voteYesOrNo", async (yesOrNo) => {
    console.log(`[voteYesOrNo] 찬성/반대 : ${yesOrNo}`);
    const userId = socket.data.userId;

    try {
      await voteYesOrNo(userId, yesOrNo);
    } catch (error) {
      console.log(`[voteYesOrNoError] ${(error as Error).message}`);
      socket.emit("[voteYesOrNoError]", (error as Error).message);
    }
  });
};
