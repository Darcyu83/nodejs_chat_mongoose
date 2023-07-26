import express from "express";
import { createRoom, enterRoom, removeRoom, renderRoom } from "./controllers";

const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
  res.send("<h1>hello From Node</h1>");
});

indexRouter.get("/room", renderRoom);
indexRouter.post("/room", createRoom);

indexRouter.get("/room/:id", enterRoom);
indexRouter.delete("/room/:id", removeRoom);

export default indexRouter;
