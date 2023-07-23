import { Schema, Types } from "mongoose";

const chatSchema = new Schema({
  room: {
    type: Types.ObjectId,
    required: true,
    ref: "Room",
  },
  user: {
    type: String,
    required: true,
  },
  chat: String, // 채팅내역
  gif: String, // gif 이미지 주소
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default chatSchema;
