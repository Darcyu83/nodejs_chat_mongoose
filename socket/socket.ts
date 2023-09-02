import { Server } from "socket.io";
import http from "http";
import { allowlist, socketAllowedHeaders } from "../constants/list";

const initSocket = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const io = new Server(server, {
    path: "/yuds.socket.io",
    transports: ["polling", "websocket"],
    cors: {
      origin: allowlist,
      methods: ["GET", "POST"],
      // allowedHeaders: socketAllowedHeaders,
      // credentials: true,
    },
  });

  const NS_ROOM = "/room";
  const NS_CHAT = "/chat";
  // 네임스페이스
  const room = io.of(`${NS_ROOM}`);
  const chat = io.of(`${NS_CHAT}`);

  // ROOM 네임스페이스 전용 이벤트
  room.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(" room 커넥션 접속 io :: ", ip, socket.id);

    const {
      headers: { referer },
    } = req; // 요청한 클라이언트 uri 정보 얻기

    const roomId = referer
      ?.split("/")
      [referer?.split("/").length - 1].replace(/\?.+/, "");

    roomId
      ? socket.join(roomId)
      : socket.emit("noRoomId", `roomId 없음 :: ${referer}`);

    socket.on("disconnect", (data) => {
      console.log("room 나감 :: ", data, ip, socket.id);
      roomId && socket.leave(roomId);
    });

    socket.on("newRoom", (msg) => {
      console.log("new room :: ", msg, "\n", ip, socket.id);
    });

    socket.emit(
      "newRoom",
      "rooom 네임스페이스 연결되었고 방만들기 요청 from server"
    );
  });

  // CHAT 네임스페이스 전용 이벤트
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
      socket.leave("roomId");
    });

    socket.emit("join", " chat 네임스페이스 연결되었고 서버에서 채팅 참여");
  });
  return io;
};

export default initSocket;
