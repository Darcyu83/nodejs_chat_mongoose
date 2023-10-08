import { RequestHandler } from "express";
import roomSchema from "../../schemas/room";
import { ChatMsg, ChatRoom } from "../../schemas";
import { NS_CHAT } from "../../constants/constants";

export const getRooms: RequestHandler = async (req, res, next) => {
  const room = await ChatRoom.find({});
  res.status(200).json(room);
};

export const createRoom: RequestHandler = async (req, res, next) => {
  try {
    const newRoom = await ChatRoom.create({
      title: req.body.title,
      max: req.body.max,
      owner: req.session.color,
      password: req.body.password,
    });

    const io = req.app.get("io");

    // io.of("/room").emit("newRoom", newRoom);

    // if (req.body.password) {
    //   res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
    // } else {
    //   res.redirect(`/room/${newRoom._id}`);
    // }

    res.status(200).json(newRoom);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const enterRoom: RequestHandler = async (req, res, next) => {
  try {
    const room = await ChatRoom.findOne({ _id: req.params.id });
    if (!room) {
      return res.status(404).json({ message: "Room does not exist." });
    }

    if (room.password && room.password !== req.query.password) {
      return res.status(401).json({ message: "Password does not match." });
    }

    const io = req.app.get("io");

    const { rooms } = io.of("/chat").adapter;

    if (room.max <= rooms.get(req.params.id)?.size) {
      return res
        .status(406)
        .json({ message: "Exceeded the permitted number of users." });
    }

    const chats = await ChatMsg.find({ room: room._id }).sort("createdAt");

    return res.status(200).json({
      room,
      title: room.title,
      chats: chats,
      user: req.session.color,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 채팅내용 저장한 후
export const sendChat: RequestHandler = async (req, res, next) => {
  try {
    const chat = await ChatMsg.create({
      room: req.params.id,
      user: req.session.color,
      chat: req.body.chat,
    });

    // console.log("send Message ==== ", req.params.id);
    req.app.get("io").of(NS_CHAT).to(req.params.id).emit("chat", chat);

    res.status(201).json({ code: 201 });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const removeRoom: RequestHandler = async (req, res, next) => {
  try {
    await ChatRoom.deleteOne({
      _id: req.params.id,
    });
    await ChatMsg.deleteMany({ room: req.params.id });
    res.status(200).json({ message: "Free to go." });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
