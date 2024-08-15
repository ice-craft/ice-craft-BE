import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getRoomInfo } from "src/api/supabase/roomAPI";

export const onUpdateRoomInfo = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("updateRoomInfo", async (roomId) => {
    console.log(`[updateRoomInfo] roomId : ${roomId}`);
    try {
      const roomInfo = await getRoomInfo(roomId);
      socket.emit("updateRoomInfo", roomInfo);
    } catch (error) {
      console.log(`[updateRoomInfoError] ${(error as Error).message}`);
      socket.emit("updateRoomInfoError", (error as Error).message);
    }
  });
};
