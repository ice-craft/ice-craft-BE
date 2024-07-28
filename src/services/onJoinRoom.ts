import { Namespace, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getRoomInfo, joinRoom } from "../api/supabase/roomAPI";

export const onJoinRoom = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  mafiaIo: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("joinRoom", async (userId, roomId, nickname) => {
    console.log(
      `[joinRoom] userId : ${userId}, roomId : ${roomId}, nickname : ${nickname}`
    );

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
      console.log(`[joinRoomError] ${(error as Error).message}`);
      socket.emit("joinRoomError", (error as Error).message);
    }
  });
};
