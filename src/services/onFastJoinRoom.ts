import { Namespace, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { fastJoinRoom, getRoomInfo } from "src/api/supabase/roomAPI";

export const onFastJoinRoom = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  mafiaIo: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("fastJoinRoom", async (userId, nickname) => {
    try {
      const roomId = await fastJoinRoom(userId, nickname);
      const roomInfo = await getRoomInfo(roomId);

      socket.join(roomId);
      socket.join(userId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;

      mafiaIo.to(roomId).emit("fastJoinRoom", roomId);
      mafiaIo.emit("updateRoomInfo", roomInfo);
    } catch (error) {
      socket.emit("fastJoinRoomError", (error as Error).message);
    }
  });
};
