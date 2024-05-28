const CREATE_ROOM = "createRoom";

export const createRoom = async (title, game_category, total_user_count) => {
  console.log(
    `[createRoom] title : ${title}, game_category : ${game_category}, total_user_count : ${total_user_count}`
  );
  try {
    const room = await createRoom(title, game_category, total_user_count);
    socket.emit("CREATE_ROOM", room);
  } catch (error) {
    console.log("[createRoomError] 방을 생성하는데 실패했습니다.");
    socket.emit("createRoomError", "방을 생성하는데 실패했습니다.");
  }
};
