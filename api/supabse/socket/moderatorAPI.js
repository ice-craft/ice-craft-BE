//NOTE - 클라이언트의 화면에 모달창을 띄움
export const showModal = (
  mafiaIo,
  roomName,
  eventName,
  title,
  message,
  timer,
  nickname,
  yesOrNo
) => {
  mafiaIo
    .to(roomName)
    .emit(eventName, title, message, timer, nickname, yesOrNo);
};

//NOTE - 사회자가 플레이어의 카메라를 끔
export const turnOffCamera = (mafiaIo, roomName, clientPlayer) => {
  mafiaIo.to(roomName).emit("setCamera", clientPlayer, false);
};

//NOTE - 사회자가 플레이어의 마이크를 끔
export const turnOffMike = (mafiaIo, roomName, clientPlayer) => {
  mafiaIo.to(roomName).emit("setMike", clientPlayer, false);
};
