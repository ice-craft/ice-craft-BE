import { db } from "../DB/db.js";

db.pragma("journal_mode = WAL");

export const getRooms = (rowStart, rowCount) => {
  try {
    const rooms = db
      .prepare(
        "SELECT room_id, title, game_category, current_user_count, total_user_count, created_at  FROM room ORDER BY created_at DESC LIMIT $rowStart, $rowCount"
      )
      .all({ rowStart, rowCount });
    return rooms;
  } catch (error) {
    console.log(error);
  }
};

export const getRoomsWithKeyword = (keyword) => {
  try {
    const rooms = db
      .prepare("SELECT * FROM room WHERE title LIKE ? ORDER BY created_at DESC")
      .all(`%${keyword}%`);
    return rooms;
  } catch (error) {
    console.log(error);
  }
};

export const createRoom = (roomId, title, gameCategory, totalUserCount) => {
  const insert = db.prepare(
    "INSERT INTO room (room_id, title, game_category, total_user_count) VALUES ($roomId, $title, $gameCategory, $totalUserCount)"
  );

  const room = {
    roomId,
    title,
    gameCategory,
    totalUserCount,
  };
  try {
    const result = insert.run(room);
    if (result.changes === 0) {
      throw new Error("데이터 삽입을 실패했습니다.");
    }
    return result.changes;
  } catch (error) {}
};

//NOTE - 방에 들어가기 (방 자리에 여유가 있고, 자신이 방에 없으면 방에 들어갈 수 있음 )
export const joinRoom = (roomId, userId, nickname) => {
  const { total_user_count, current_user_count } = getUserCountInRoom(roomId);
  const usersInRoom = getUsersInRoom(roomId);

  if (
    total_user_count - current_user_count > 0 &&
    usersInRoom.indexOf(userId) === -1
  ) {
    changeUserCountInRoom(roomId, 1);
    const insert = db.prepare(
      "INSERT INTO user (room_id, user_id, nickname) VALUES ($roomId, $userId, $nickname)"
    );

    const user = { roomId, userId, nickname };

    try {
      const result = insert.run(user);
      if (result.changes === 0) {
        throw new Error("데이터 삽입을 실패했습니다.");
      }
      return result.changes;
    } catch (error) {
      console.log(error);
    }
  }
};

//NOTE - 방 나가기 (내가 방에 존재하고 나 이외에 유저가 있으면 방에서 나감, 다른 유저가 방에 없으면 방 삭제)
export const exitRoom = (roomId, userId) => {
  const { current_user_count } = getUserCountInRoom(roomId);
  const usersInRoom = getUsersInRoom(roomId);

  if (current_user_count > 1 && usersInRoom.indexOf(userId) !== -1) {
    changeUserCountInRoom(roomId, -1);

    const result = db
      .prepare("DELETE FROM user WHERE user_id = $userId")
      .run({ userId });
    return result;
  } else if (current_user_count === 1 && usersInRoom.indexOf(userId) !== -1) {
    const data = deleteRoom(roomId, userId);
    return data;
  }
};

//NOTE - 방 삭제하기 (방에 있는 유저가 오직 자신일 경우에 방 삭제)
export const deleteRoom = (roomId, userId) => {
  const { current_user_count } = getUserCountInRoom(roomId);
  const usersInRoom = getUsersInRoom(roomId);

  if (current_user_count === 1 && usersInRoom.indexOf(userId) !== -1) {
    db.prepare("DELETE FROM room WHERE room_id = $roomId").run({ roomId });
    db.prepare("DELETE FROM user WHERE room_id = $roomId").run({ roomId });
  }
};

//NOTE - 빠른 방 입장 (전체 인원 오름차순으로 정렬 후, 현재 인원 내림차순 정렬 후, 남은 인원이 0명인 방을 제외한 후, 첫 번째 방 입장)
export const fastJoinRoom = (userId, nickname) => {
  try {
    const { room_id } = db
      .prepare(
        "SELECT room_id FROM room WHERE current_user_count <> total_user_count ORDER BY total_user_count - current_user_count ASC LIMIT 1"
      )
      .get();

    const result = joinRoom(room_id, userId, nickname);
    return result;
  } catch (error) {
    console.log(error);
  }
};

//NOTE - 방의 현재 인원 변경 (방의 인원을 change만큼 더함, change는 음수가 될 수 있어서, 인원을 감소할 수 있음)
export const changeUserCountInRoom = (roomId, change) => {
  try {
    const update = db.prepare(
      "UPDATE room SET current_user_count = current_user_count + $change WHERE room_id = $roomId"
    );
    const result = update.run({ roomId, change });
    if (result.changes === 0) {
      throw new Error("갱신 에러");
    }
    return result.changes;
  } catch (error) {
    console.log(error);
  }
};

export const getUserCountInRoom = (roomId) => {
  try {
    const count = db
      .prepare(
        "SELECT current_user_count, total_user_count FROM room WHERE room_id = $roomId"
      )
      .get({ roomId });

    return count;
  } catch (error) {
    console.log(error);
  }
};

//NOTE - 방의 총 갯수 반환
export const getRoomsCount = () => {
  try {
    const { "COUNT(*)": count } = db.prepare("SELECT COUNT(*) FROM room").get();

    return count;
  } catch (error) {
    console.log(error);
  }
};

//NOTE - roomId의 방에 입장한 유저들 id 목록 반환
export const getUsersInRoom = (roomId) => {
  try {
    const users = db
      .prepare("SELECT user_id FROM user WHERE room_id = $roomId")
      .all({ roomId });

    return users.map((user) => user.user_id);
  } catch (error) {
    console.log(error);
  }
};

export const createRoomTable = () => {
  db.exec(
    "CREATE TABLE room (room_id TEXT PRIMARY KEY, title TEXT, game_category TEXT, current_user_count INTEGER DEFAULT 0, total_user_count INTEGER, created_at DATETIME DEFAULT (DATETIME('now', 'localtime')))"
  );
  db.exec("CREATE INDEX idx_room_id ON room (room_id)");
};

export const createUserTable = () => {
  db.exec(
    "CREATE TABLE user (user_id TEXT PRIMARY KEY, room_id TEXT, nickname TEXT, is_ready INTEGER DEFAULT 0, role TEXT DEFAULT 시민, is_lived INTEGER DEFAULT 1, vote_to TEXT DEFAULT NULL, voted_count INTEGER DEFAULT 0)"
  );
  db.exec("CREATE INDEX idx_user_id ON user (user_id)");
};
