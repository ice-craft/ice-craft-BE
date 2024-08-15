import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getRooms } from "src/api/supabase/roomAPI";

export const onEnterMafia = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("enterMafia", async () => {
    console.log("[enterMafia]");
    try {
      const rooms = await getRooms();
      socket.emit("enterMafia", rooms);
    } catch (error) {
      console.log(`[enterMafiaError] ${(error as Error).message}`);
      socket.emit("enterMafiaError", (error as Error).message);
    }
  });
};
