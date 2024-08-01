import { Namespace, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getUsersInfoInRoom } from "src/api/supabase/roomAPI";

export const onUserInfo = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  mafiaIo: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("usersInfo", async (roomId) => {
    try {
      const usersInfo = await getUsersInfoInRoom(roomId);
      mafiaIo.to(roomId).emit("usersInfo", usersInfo);
    } catch (error) {
      socket.emit("usersInfoError", (error as Error).message);
    }
  });
};
