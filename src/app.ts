import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { onEnterMafia } from "src/services/onEnterMafia";
import { onCreateRoom } from "src/services/onCreateRoom";
import { onJoinRoom } from "src/services/onJoinRoom";
import { onFastJoinRoom } from "src/services/onFastJoinRoom";
import { onExitRoom } from "src/services/onExitRoom";
import { onSetReady } from "src/services/onSetReady";
import { onUserInfo } from "src/services/onUserInfo";
import { onDisconnect } from "src/services/onDisconnect";
import { onGameStart } from "src/services/onGameStart";
import { onVoteTo } from "src/services/onVoteTo";
import { onVoteYesOrNo } from "src/services/onVoteYesOrNo";
import { onSelectPlayer } from "src/services/onSelectPlayer";
import { onUpdateRoomInfo } from "src/services/onUpdateRoomInfo";

const app = express();
const httpServer = createServer(app);
const port = 4000;
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const mafiaIo = io.of("/mafia");

app.get("/", (req, res) => {
  res.send("express 서버와 연결되어 있습니다.");
});

mafiaIo.on("connection", (socket) => {
  onEnterMafia(socket);

  onCreateRoom(socket);

  onJoinRoom(socket, mafiaIo);

  onFastJoinRoom(socket, mafiaIo);

  onExitRoom(socket, mafiaIo);

  onSetReady(socket, mafiaIo);

  onUserInfo(socket, mafiaIo);

  onUpdateRoomInfo(socket);

  onDisconnect(socket, mafiaIo);

  onGameStart(socket, mafiaIo);

  onVoteTo(socket);

  onVoteYesOrNo(socket);

  onSelectPlayer(socket);
});

httpServer.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});
