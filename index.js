//NOTE - 네임스페이스, 룸 구현

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  fastJoinRoom,
  getRooms,
  getUserIdInRoom,
  getUserInfoInRoom,
  joinRoom,
} from "./api/supabse/roomAPI.js";

const app = express();
const httpServer = createServer(app);
const port = 4000;
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const mafiaIo = io.of("/mafia");

app.get("/", (req, res) => {
  res.send("express 서버와 연결되어 있습니다.");
});

mafiaIo.on("connection", (socket) => {
  socket.on("toAll", (nickname, message) => {
    socket.broadcast
      .to(userInRoom[nickname])
      .emit("server", `[${nickname}] ${message}`);
    socket.emit("server", `[나] ${message}`);
  });

  socket.on("enterMafia", async () => {
    console.log("방 목록 가져오기");
    const rooms = await getRooms(0, 10);
    socket.emit("rooms", rooms);
  });

  // socket.on("getUserIdInRoom", async (roomId) => {
  //   console.log("방 안의 유저들 id 목록 가져오기", roomId);
  //   const userId = await getUserIdInRoom(roomId);
  //   socket.emit("userIdInRoom", userId);
  // });

  // socket.on("getUserInfoInRoom", async (roomId) => {
  //   console.log("방 안의 유저들 id와 닉네임목록 가져오기", roomId);
  //   const userInfo = await getUserInfoInRoom(roomId);
  //   socket.emit("userInfoInRoom", userInfo);
  // });

  socket.on("joinRoom", async (userId, roomId, nickname) => {
    console.log(
      `[joinRoom] : userId : ${userId}, roomId : ${roomId}, nickname : ${nickname}`
    );
    try {
      socket.join(roomId);

      await joinRoom(roomId, userId, nickname);
      const userInfo = await getUserInfoInRoom(roomId);

      mafiaIo.to(roomId).emit("joinRoom", userInfo);
    } catch (error) {
      mafiaIo.to(roomId).emit("joinRoomError", "방 입장에 실패했습니다.");
    }
  });

  socket.on("fastJoinRoom", async (userId, nickname) => {
    console.log(`[fastJoinRoom] : userId : ${userId}, nickname : ${nickname}`);
    let roomId;
    try {
      const { room_id } = await fastJoinRoom(userId, nickname);
      roomId = room_id;
      socket.join(roomId);
      console.log(roomId);

      const userInfo = await getUserInfoInRoom(roomId);

      mafiaIo.to(roomId).emit("fastJoinRoom", roomId, userInfo);
    } catch (error) {
      mafiaIo.to(roomId).emit("fastJoinRoomError", "방 입장에 실패했습니다.");
    }
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
