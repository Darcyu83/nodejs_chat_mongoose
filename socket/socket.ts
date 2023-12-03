import { Server } from "socket.io";
import http from "http";
import {
  NS_CHAT,
  NS_ROOM,
  allowlist,
  socketAllowedHeaders,
} from "../constants/constants";

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

  io.emit("entire", "Global");

  // 네임스페이스
  const room = io.of(`${NS_ROOM}`);
  const chat = io.of(`${NS_CHAT}`);

  // ROOM 네임스페이스 전용 이벤트
  room.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(" room 커넥션 접속 io :: IP / socket.id", ip, socket.id);

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
      console.log("room disconnect :: ", data, ip, socket.id);
      roomId && socket.leave(roomId);
    });

    socket.on("newRoom", (msg) => {
      console.log("new room :: ", msg, "\n", ip, socket.id);
    });

    // 메시지 발송 3개
    socket.emit(
      "newRoom",
      "rooom 네임스페이스 연결되었고 방만들기 요청 from server"
    );

    socket.broadcast.emit("broadcasttest", "이거슨 to room");
  });

  // CHAT 네임스페이스 전용 이벤트
  chat.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(" chat 커넥션 접속 io :: ", ip, socket.id);

    //
    socket.on("join", (roomId) => {
      console.log("chat join :: ", roomId, ip, socket.id);

      socket.join(roomId);
      socket
        .to(roomId)
        .emit("entered", { msg: "방에 입장하였습니다.", roomId });
    });

    //
    socket.on("exit", (data) => {
      console.log("chat exit 나감 :: ", data, ip, socket.id);
    });

    // socket.on("snedMsgToRoom", (data) => {
    //   console.log("snedMsgToRoom:: ", data, "\n", ip, socket.id);

    //   socket.emit("receivedMsgToFE", data);
    // });

    socket.on("disconnect", (data) => {
      console.log("chat disconnect :: ", data, ip, socket.id);
      socket.leave("roomId");
    });

    interface IChatParams {
      message: string;
      sender: string;
      sendee: string;
      roomId: string;
    }
    socket.on("chat", (params: IChatParams) => {
      console.log("chat :: ", params, ip, socket.id);
      socket.to(params.roomId).emit("chat", params);
    });
  });

  io.sockets.emit("totest", "이거슨 to room");
  return io;
};

export default initSocket;
