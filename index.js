import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("연결됨");
  socket.emit("소켓과 연결되었습니다.");
});

httpServer.listen(4000);
