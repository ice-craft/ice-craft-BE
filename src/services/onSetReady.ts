import { Namespace, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { setReady } from "src/api/supabase/gamePlayAPI";
import { canGameStart } from "src/api/socket/moderatorAPI";

export const onSetReady = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  mafiaIo: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("setReady", async (userId, ready) => {
    console.log(`[setReady] userId : ${userId}, ready : ${ready}`);

    try {
      await setReady(userId, ready);

      const roomId = socket.data.roomId;
      mafiaIo.to(roomId).emit("setReady", userId, ready);
      await canGameStart(roomId, mafiaIo);
    } catch (error) {
      console.log(`[setReadyError] ${(error as Error).message}`);
      socket.emit("setReadyError", (error as Error).message);
    }
  });
};
