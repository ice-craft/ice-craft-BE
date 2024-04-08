//NOTE - 네임스페이스, 룸 구현

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const port = 4000;
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const mafiaIo = io.of("/mafia");
const userInRoom = {};

app.get("/", (req, res) => {
  res.send("express 서버와 연결되어 있습니다.");
});

mafiaIo.on("connection", (socket) => {
  socket.on("toAll", (nickname, message) => {
    socket.to(userInRoom[nickname]).emit("server", `[${nickname}] ${message}`);
  });

  socket.on("enterMafia", (nickname) => {
    socket.emit("server", "마피아 게임에 들어오신 것을 환영합니다.");
    socket.broadcast.emit(
      "server",
      `${nickname}님이 마피아 게임에들어오셨습니다.`
    );
  });

  socket.on("enterRoom", (nickname, roomId) => {
    socket.join(roomId);
    userInRoom[nickname] = roomId;
    socket.broadcast
      .to(roomId)
      .emit("server", `${nickname}님이 방${roomId}에 들어오셨습니다.`);
    socket.emit("server", `방${roomId}에 들어오신 것을 환영합니다.`);
  });

  socket.on("exit", (nickname) => {
    socket.broadcast.emit("server", `${nickname}님이 나가셨습니다.`);
  });
});

io.on("disconnection", () => {
  console.log("클라이언트와의 연결이 끊겼습니다.");
});

httpServer.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});
