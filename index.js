import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const port = 4000;
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("연결됨");
  socket.emit("소켓과 연결되었습니다.");
});

app.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});
