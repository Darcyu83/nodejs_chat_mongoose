import mongoose from "mongoose";
import chatSchema from "./chat";
import roomSchema from "./room";

const connectMongoose = () => {
  if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", true);
  }

  mongoose
    .connect(process.env.MONGO_URL || "", {
      dbName: "gifchat",
    })
    .then(() => {
      console.log("몽고디비 연결 성공", process.env.MONGO_URL);
    })
    .catch((err) => {
      console.log("몽고디비 연결 에러", process.env.MONGO_URL, err);
    });
};

mongoose.connection.on("error", (error) => {
  console.log("몽고디비 연결 에러", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("몽고디비 연결 해제됨");
});

export const ChatMsg = mongoose.model("ChatMsg", chatSchema, "chat_log");
export const ChatRoom = mongoose.model("ChatRoom", roomSchema, "chat_room");

export default connectMongoose;
