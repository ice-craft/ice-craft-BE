import { Namespace, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { exitRoom, getRoomInfo } from "src/api/supabase/roomAPI";

export const onDisconnect = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  mafiaIo: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("disconnect", async () => {
    try {
      const roomId = socket.data.roomId;
      const userId = socket.data.userId;

      if (!roomId) {
        return;
      }

      const roomInfo = await getRoomInfo(roomId);

      await exitRoom(roomId, userId);

      socket.leave(userId);
      socket.leave(roomId);
      socket.data.userId = null;
      socket.data.roomId = null;

      mafiaIo.to(roomId).emit("exitRoom");
      mafiaIo.emit("updateRoomInfo", roomInfo);
    } catch (error) {}
  });
};
