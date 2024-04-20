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

//NOTE - 사회자가 플레이어의 카메라를 끔
export const turnOnCamera = (mafiaIo, roomName, clientPlayer) => {
  mafiaIo.to(roomName).emit("setCamera", clientPlayer, true);
};

//NOTE - 사회자가 플레이어의 마이크를 끔
export const turnOnMike = (mafiaIo, roomName, clientPlayer) => {
  mafiaIo.to(roomName).emit("setMike", clientPlayer, true);
};

//NOTE - 참가자들 랜덤으로 섞기(피셔-예이츠 셔플 알고리즘)
export const shufflePlayers = (allPlayers) => {
  for (let i = allPlayers.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
  }
  return allPlayers;
};

//NOTE - 플레이어에게 다른 플레이어의 역할 공개
export const openPlayerRole = (mafiaIo, clientUserId, roleUserId, role) => {
  mafiaIo.to(clientUserId).emit("openPlayerRole", roleUserId, role);
};
