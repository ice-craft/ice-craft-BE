import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { selectPlayer } from "../api/supabase/gamePlayAPI";

export const onSelectPlayer = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("selectPlayer", async (selectedPlayer) => {
    console.log(
      `[selectedPlayer] 의사에 의해 선택받은 플레이어 : ${selectedPlayer}`
    );

    try {
      await selectPlayer(selectedPlayer);
    } catch (error) {
      console.log(`[selectPlayerError] ${(error as Error).message}`);
      socket.emit("selectPlayerError", (error as Error).message);
    }
  });
};
