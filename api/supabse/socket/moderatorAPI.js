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
    .emit(eventName, title, message, timer, nickname, yesOrNo); //NOTE - 테스트 코드라서 .to(roomName) 제외
};
