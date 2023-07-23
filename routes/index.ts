import express from "express";
import { createRoom, enterRoom, removeRoom, renderRoom } from "./controllers";

const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
  res.render("index");
});

indexRouter.get("/room", renderRoom);
indexRouter.post("/room", createRoom);

indexRouter.get("/room/:id", enterRoom);
indexRouter.delete("/room/:id", removeRoom);

export default indexRouter;
