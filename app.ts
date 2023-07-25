import dotenv from "dotenv";
import express, { ErrorRequestHandler, RequestHandler } from "express";
import SocketIO from "./socket/socket";
import nunjucks from "nunjucks";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import indexRouter from "./routes";
import connectMongoose from "./schemas";
import ColorHash from "color-hash";
// As Submodule here
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

const io = SocketIO(server);
app.set("io", io);
