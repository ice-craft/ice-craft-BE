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

app.get("/", (req, res) => {
  res.send("connected");
});

io.on("connection", (socket) => {
  console.log("connected");
});

io.on("disconnection", (socket) => {
  console.log("disconnect");
});

httpServer.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});
