export const enterMafia = async (rowStart, rowEnd) => {
  console.log(`[enterMafia] rowStart : ${rowStart}, rowEnd : ${rowEnd}`);
  try {
    const rooms = await getRooms(rowStart, rowEnd);
    socket.emit("enterMafia", rooms);
  } catch (error) {
    console.log("[enterMafiaError] 방 목록을 불러오는데 실패했습니다.");
    socket.emit("enterMafiaError", "방 목록을 불러오는데 실패했습니다.");
  }
};
