export interface VoteBoard {
  user_id: string;
  user_nickname: string;
  voted_count: number;
  role: string;
  is_lived: boolean;
}

export interface AllPlayer {
  user_id: string;
  user_nickname: string;
  is_lived: boolean;
  role: string;
}

export interface MostVotedPlayer {
  isValid: boolean;
  result: VoteBoard | AllPlayer;
}

export interface YesOrNoVoteResult {
  result: boolean;
  detail: {
    yesCount: number;
    noCount: number;
  };
}

export interface Media {
  [key: string]: { [key: string]: boolean };
}

export interface RoundStatus {
  [key: string]: string;
}
