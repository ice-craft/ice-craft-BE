import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { selectPlayer } from "src/api/supabase/gamePlayAPI";

export const onSelectPlayer = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("selectPlayer", async (selectedPlayer) => {
    try {
      await selectPlayer(selectedPlayer);
    } catch (error) {
      socket.emit("selectPlayerError", (error as Error).message);
    }
  });
};
