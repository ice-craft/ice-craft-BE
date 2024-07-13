export type voteBoardType = {
  user_id: string;
  user_nickname: string;
  voted_count: number;
  role: string;
  is_lived: boolean;
}[];

export type allPlayersType = {
  user_id: string;
  user_nickname: string;
  is_lived: boolean;
  role: string;
}[];
