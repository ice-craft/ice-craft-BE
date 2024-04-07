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

let count = 0;

app.get("/", (req, res) => {
  res.send("express 서버와 연결되어 있습니다.");
});

io.on("connection", (socket) => {
  socket.emit("server", `${socket.id}님이 들어 오셨습니다.`);
});

io.on("disconnection", (socket) => {
  socket.emit("server", `${socket.id}님이 나가셨습니다.`);
});

httpServer.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});
