import { RequestHandler } from "express";
import roomSchema from "../../schemas/room";
import { ChatRoom } from "../../schemas";
import { app } from "../../app";

export const renderRoom: RequestHandler = (req, res, next) => {
  res.render("index", { title: "GIF 채팅방 생성" });
};
export const createRoom: RequestHandler = async (req, res, next) => {
  try {
    const newRoom = await ChatRoom.create({
      title: req.body.title,
      max: req.body.max,
      owner: req.session.color,
      password: req.body.password,
    });

    const io = app.get("io");
    io.of("/room").emit("newRoom", newRoom);

    if (req.body.password) {
      res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
    } else {
      res.redirect(`/room/${newRoom._id}`);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const enterRoom: RequestHandler = (req, res, next) => {};
export const removeRoom: RequestHandler = (req, res, next) => {};
