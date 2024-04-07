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
  console.log("클라이언트와 연결되었습니다.");
});

io.on("disconnection", (socket) => {
  console.log("클라이언트와 연결이 끊겼습니다.");
});

httpServer.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});
