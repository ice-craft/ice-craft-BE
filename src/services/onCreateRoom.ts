import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { createRoom } from "src/api/supabase/roomAPI";

export const onCreateRoom = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("createRoom", async (title, game_category, total_user_count) => {
    try {
      const room = await createRoom(title, game_category, total_user_count);
      socket.emit("createRoom", room);
    } catch (error) {
      socket.emit("createRoomError", (error as Error).message);
    }
  });
};
