import dotenv from "dotenv";
import express, { ErrorRequestHandler, RequestHandler } from "express";
import initSocket from "./socket/socket";
import nunjucks from "nunjucks";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import indexRouter from "./routes";
import connectMongoose from "./schemas";
import ColorHash from "color-hash";
import cors from "cors";
import chatRouter from "./routes/chat";

// TEST TEXT
dotenv.config();
// mongoose
connectMongoose();
export const app = express();

app.set("port", process.env.PORT || 4013);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET || "none",
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

const handleSessionIdWithColor: RequestHandler = (req, res, next) => {
  if (!req.session?.color) {
    const colorHash = new ColorHash();
    req.session.color = colorHash.hex(req.sessionID);
    console.log(req.session.color, req.sessionID);
  }

  next();
};

app.use("/chat", handleSessionIdWithColor, chatRouter);
app.use("/", handleSessionIdWithColor, indexRouter);

const handleWrongRequest: RequestHandler = (req, res, next) => {
  const err = new Error(`${req.method} ${req.url} :: 잘못된 요청입니다.`);
  err.status = 404;
  next(err);
};
const handleError: ErrorRequestHandler = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ code: err.status, message: err.message });
};

// 잘못된 url
app.use(handleWrongRequest);
// 에러 핸들러
app.use(handleError);

const server = app.listen(app.get("port"), () => {
  console.log(`포트 ${app.get("port")}번에서 대기`);
});

const io = initSocket(server);

//path 지정한 IO객체를 전역 등록
app.set("socketIO", io);

// 사용법 :  req.app.get("io");
// io.of("/room").emit("newRoom" , "보낼 메시지")
// io.of("/room").on("newRoom", (msg) =>{  })

// default name space "/"
// io.on("connection", (socket) => {
//   socket.on("disconnect", () => {});
// });

// io.sockets.emit("hi", "everyone");
// io.emit("hi", "everyone");

// 미들웨어
// io.use((socket, next) => {
//   if (socket.request) {
//     const request = socket.request;
//     // const response = socket.request.res;

//     // cookieParser(process.env.COOKIE_SECRET)(socket.request, , next)
//     next();
//   } else {
//     next(new Error("소켓 요청없음"));
//   }
// });

// 커스텀 네임스페이스
// io.of("/admin").use(async (socket, next) => {
//   // const user = await fetch(socket?.handshake?.query);

//   if ("ok") {
//     next();
//   } else {
//     next(new Error(""));
//   }
// });

// Handling middleware error
// next 메소드가 Error 객체와 함께 호출되면 클라이언트는 connect_error 이벤트를 수신한다.
// express의 에러처리 미들웨어의 소켓IO 버젼 이라고 보면 된다.
// socket.on("connect_error", (err) => {
//   console.log(err.message); // prints the message associated with the error, e.g. "thou shall not pass" in the example above
// });

// 전체 메시지
// req.app.get("io").emit("이벤트" ,"메시지")

// 네임스페이스 안에 전체 메시지
// req.app.get("io").of("네임스페이스").emit("이벤트" ,"메시지")

// 네임스페이스 > 룸 안에 전체 메시지
// req.app.get('io').of('네임스페이스').to(roomId).emit("이벤트" ,"메시지")

// 특정 유저에게 메시지 1:1 대화 귓속말
// req.app.get('io').to(socket.id).emit("이벤트" ,"메시지")

// 나를 제외한 모든 유저에게
// req.app.get('io').broadcast.emit("이벤트", '메시지')
