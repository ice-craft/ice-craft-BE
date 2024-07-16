import { getVoteToResult } from "./src/api/supabase/gamePlayAPI";

const test = async () => {
  try {
    const voteBoard = await getVoteToResult(
      "cf6641ae-07ec-4f05-96d0-4356ff6f60a3"
    ); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
    // const mostVoteResult = getMostVotedPlayer(voteBoard, true); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)
    console.log(voteBoard);
  } catch (error) {
    console.log((error as Error).message);
  }
};

export const shuffle = (allPlayers: any) => {
  for (let i = allPlayers.length - 1; i >= 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
  }
  return allPlayers;
};

const array = [1, 2, 3, 4, 5];
const a = shuffle(array);
console.log(a);
