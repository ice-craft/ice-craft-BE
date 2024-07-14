export type voteBoardType = {
  user_id: string;
  user_nickname: string;
  voted_count: number;
  role: string;
  is_lived: boolean;
};

export type allPlayerType = {
  user_id: string;
  user_nickname: string;
  is_lived: boolean;
  role: string;
};

export type MostVotedPlayer = {
  isValid: boolean;
  result: voteBoardType | allPlayerType;
};

export type mediaType = { [key: string]: { [key: string]: boolean } };
