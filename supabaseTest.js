import { getUserCountInRoom } from "./supabse/roomAPI.js";

const test = async () => {
  const userCount = await getUserCountInRoom(
    "fe423c73-78cc-46e4-b93c-19fb0aa3e28d"
  );
  console.log(userCount);
};

test();
