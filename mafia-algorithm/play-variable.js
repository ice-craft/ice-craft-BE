//NOTE - 플레이어 수
let playerCount;

//NOTE - 랜덤으로 지정된 플레이어
let randomPlayer;

//NOTE - 마피아 플레이어 인원 수
let mafiaCount;

//NOTE - 플레이어들의 찬반 투표 결과
const votes = [];

//NOTE - 역할이 마피아인 플레이어 목록
let mafiaPlayers;

//NOTE - 역할이 의사인 플레이어
let doctorPlayer;

//NOTE - 역할이 경찰인 플레이어
let policePlayer;

//NOTE - 역할이 시민인 플레이어 목록
let citizenPlayers;

//NOTE - 죽은 플레이아
let killedPlayer;

//NOTE - 죽기로 결정된 플레이어
let playerToKill;

//NOTE - 살리기로 결정된 플레이어
let playerToSave;

//NOTE - 경찰이 조사한 플레이어가 마피아인지 여부
let isPlayerMafia;

//NOTE - 방을 나갈지 선택
let choiceToExit;
