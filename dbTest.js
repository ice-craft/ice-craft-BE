import Database from "better-sqlite3";

const db = new Database(":memory:", { verbose: console.log });
db.pragma("journal_mode = WAL");

db.exec("CREATE TABLE user (user_id TEXT PRIMARY KEY, nickname TEXT)");
db.exec("CREATE INDEX idx_code ON user (user_id)");

const insert = db.prepare(
  "INSERT INTO user (user_id, nickname) VALUES ($user_id, $nickname)"
);

const users = [
  { user_id: "111", nickname: "test1" },
  { user_id: "222", nickname: "test2" },
  { user_id: "333", nickname: "test3" },
  { user_id: "444", nickname: "test4" },
  { user_id: "555", nickname: "test5" },
];

for (const user of users) {
  insert.run(user);
}
try {
  const update = db.prepare(
    "UPDATE user SET nickname = $nickname WHERE user_id = $user_id"
  );
  const result = update.run({ nickname: "nickname3", user_id: "555" });
  if (result.changes === 0) {
    throw new Error("갱신 에러");
  }
} catch (error) {
  console.log(error);
}
try {
  const selectMany = db.prepare("SELECT * FROM user WHERE user_id = ?");
  const allUser = selectMany.all("999");
  console.log(allUser);
} catch (e) {
  console.log(e);
}
