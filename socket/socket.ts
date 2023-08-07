import { Server } from "socket.io";
import http from "http";

const initSocket = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const io = new Server(server, {
    path: "/socket.io",
    transports: ["polling", "websocket"],
  });

  const room = io.of("/room");
  const chat = io.of("/chat");

  room.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(" room 커넥션 접속 io :: ", ip, socket.id);

    //
    socket.on("newRoom", (data) => {
      console.log("new room :: ", data, ip, socket.id);
    });

    //
    socket.on("disconnect", (data) => {
      console.log("room 나감 :: ", data, ip, socket.id);
    });
  });

  chat.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(" chat 커넥션 접속 io :: ", ip, socket.id);

    //
    socket.on("join", (data) => {
      console.log("chat join :: ", data, ip, socket.id);
    });

    //
    socket.on("exit", (data) => {
      console.log("chat exit 나감 :: ", data, ip, socket.id);
    });

    //
    socket.on("disconnect", (data) => {
      console.log("chat disconnect :: ", data, ip, socket.id);
    });
  });
  return io;
};

export default initSocket;
