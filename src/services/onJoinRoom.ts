import { Namespace, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getRoomInfo, joinRoom } from "src/api/supabase/roomAPI";

export const onJoinRoom = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  mafiaIo: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("joinRoom", async (userId, roomId, nickname) => {
    try {
      await joinRoom(roomId, userId, nickname);
      const roomInfo = await getRoomInfo(roomId);

      socket.join(roomId);
      socket.join(userId);
      socket.data.userId = userId;
      socket.data.roomId = roomId;

      mafiaIo.to(roomId).emit("joinRoom", roomId);
      mafiaIo.emit("updateRoomInfo", roomInfo);
    } catch (error) {
      socket.emit("joinRoomError", (error as Error).message);
    }
  });
};
