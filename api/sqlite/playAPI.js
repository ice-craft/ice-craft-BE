import { db } from "../DB/db.js";

db.pragma("journal_mode = WAL");

//NOTE - 방의 총 인원 수와 현재 인원수 가져옴
const getPlayerCount = () => {
  //NOTE - roomAPI 메서드 활용
};

//NOTE - 방 인원수가 가득찼는지 확인
const checkPlayerCountEnough = () => {
  //NOTE - roomAPI 메서드 활용
};

//NOTE - 레디한 인원수 비교
const checkAllPlayersReady = () => {
  //NOTE - select count(*) from user where room_id = roomId and is_ready=1;
  //NOTE - 레디한 인원 수랑 총 인원수랑 비교
};

//NOTE - 역할배정
