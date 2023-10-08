import express from "express";

import {
  createRoom,
  enterRoom,
  removeRoom,
  getRooms,
  sendChat,
} from "./controllers/chat";

const chatRouter = express.Router();

chatRouter.get("/", (req, res) => {
  return res.send("통신성공");
});

chatRouter.get("/rooms", getRooms);
chatRouter.post("/room", createRoom);

chatRouter.get("/room/:id", enterRoom);
chatRouter.delete("/room/:id", removeRoom);
chatRouter.post("/room/:id/chat", sendChat);

export default chatRouter;
