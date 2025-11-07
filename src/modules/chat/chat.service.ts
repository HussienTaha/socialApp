import { FILE_TYPES } from './../../utils/fileTypes';
import { NextFunction, Request, Response } from "express";
import { chatRepository } from "../../DB/repositories/chat.reposatories";
import { ChatModel } from "../../DB/models/chat.model";
import { CustomError } from "../../utils/classErrorHandling";
import { Server, Socket } from "socket.io";
import { SocketWithUser } from "../gateway/gateway.interface";
import { UserRepository } from "../../DB/repositories/user.reposatories";
import userModel from "../../DB/models/user.model";
import { connectionSocket } from "../gateway/gateway";
import mongoose, { Types } from "mongoose";
import { deleteFile, uploadFile } from "../../utils/s3config";
import { v4 as uuidv4 } from "uuid";

export class ChatService {
  constructor() {}
  private _userModel = new UserRepository(userModel);
  private _chatModel = new chatRepository(ChatModel);
  getChats = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const chat = await this._chatModel.findOne(
      {
        participants: { $all: [userId, req?.user?._id] },
        group: { $exists: false },
      },
      { messages: { $slice: -100 } },
      { populate: [{ path: "participants" }] }
    );

    if (!chat) {
      throw new CustomError("chat not found", 404);
    }

    return res.status(200).json({ message: "success", chat });
  };

getGoupChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params as { groupId: string };
    console.log("groupId from params:", groupId);

 
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw new CustomError("Invalid group id", 400);
    }

    const chat = await this._chatModel.findOne(
      {
        _id: groupId,
        participants: { $in: [req?.user?._id] },
        group: { $exists: true },
      },
      { messages: { $slice: -10 } },
      { populate: [{ path: "messages.createdBy" }] }
    );

    if (!chat) {
      throw new CustomError("chat not found", 404);
    }

    return res.status(200).json({ message: "success", chat });
  } catch (error: any) {
    // ✅ هندلة الكاست إيرور من Mongoose
    if (error instanceof mongoose.Error.CastError) {
      return next(new CustomError("Invalid group id format", 400));
    }

    return next(error);
  }
};

  sayhiiiii = async (data: any, socket: SocketWithUser, io: Server) => {
    console.log(data);
  };

 sendGroupMessage = async (data: any, socket: SocketWithUser, io: Server) => {

    const { content, groupId } = data;
    // console.log({content,sendTo, userid: socket?.user?._id});
    if (!content?.trim()) {
      throw new CustomError("Message content cannot be empty", 400);
    }
    const createdBy = socket?.user?._id;
    if (!createdBy) {
      throw new CustomError("User not authenticated", 401);
    }
    const chat = await this._chatModel.findOneAndupdate({
_id: groupId,participants: { $in: [createdBy] },group: { $exists: true },
    }, {
$push: {
    messages: {
        content,
        createdBy,
    },
}


    });

    if (!chat) {
      throw new CustomError("Chat not found", 404);
    }


    io.to(connectionSocket.get(createdBy.toString())!).emit("successMessage", {
      content,
    });
    io.to(chat.roomId!).emit("newMessage", {
      content,
      from: socket?.user,
      groupId
    });
  };

  sendMessage = async (data: any, socket: SocketWithUser, io: Server) => {
    const { content, sendTo } = data;
    // console.log({content,sendTo, userid: socket?.user?._id});
    if (!content?.trim()) {
      throw new CustomError("Message content cannot be empty", 400);
    }
    const createdBy = socket?.user?._id;
    if (!createdBy) {
      throw new CustomError("User not authenticated", 401);
    }
    const user = await this._userModel.findOne({
      _id: sendTo,
      friends: { $in: [createdBy] },
    });

    if (!user) {
      throw new CustomError("user not found", 404);
    }

    const chat = await this._chatModel.findOneAndupdate(
      {
        participants: { $all: [createdBy, sendTo] },
        group: { $exists: false },
      },
      { $push: { messages: { content, createdBy } } }
    );
    if (!chat) {
      const newChat = await this._chatModel.create({
        participants: [createdBy, sendTo],
        createdBy,
        messages: [{ content, createdBy }],
      });
      if (!newChat) {
        throw new CustomError("Failed to create chat", 500);
      }
    }
    io.to(connectionSocket.get(createdBy.toString())!).emit("successMessage", {
      content,
    });
    io.to(connectionSocket.get(sendTo.toString())!).emit("newMessage", {
      content,
      from: socket?.user,
    });
  };

  createGoupChat = async (req: Request, res: Response, next: NextFunction) => {
    let { group, participants, groupImage } = req.body;

    const createdBy = req.user?._id as Types.ObjectId;
    const dbParticipants = participants.map((participant: string) =>
      Types.ObjectId.createFromHexString(participant)
    );

    const users = await this._userModel.Find({
      filter: { _id: { $in: dbParticipants }, friends: { $in: [createdBy] } },
    });
    if (users.length !== participants.length) {
      throw new CustomError("some users not found", 404);
    }
    const roomId = `${group
      ?.trim() // يشيل أي مسافات في الأول والآخر
      .replaceAll(/\s+/g, "-") // يحوّل المسافات لعلامة "-"
      .replaceAll(/[^a-zA-Z0-9-_]/g, "") // يشيل أي رموز غريبة أو حروف غير مفهومة
      .toLowerCase()}_${Date.now()}_${uuidv4().slice(0, 8)}`;

    console.log(roomId);

    if (req?.file) {
      groupImage = await uploadFile({
        Path: `chat/${roomId}_${uuidv4()}`, // اسم فولدر مميز للجروب
        file: req.file as Express.Multer.File,
      });
      dbParticipants.push(createdBy);

      const newChat = await this._chatModel.create({
        participants: dbParticipants,
        createdBy,
        group,
        groupImage,
        roomId,
        messages: [],
      });
      if (!newChat) {
        if (req?.file) {
          await deleteFile({
            Key: `chat/${roomId}_${uuidv4()}`, // اسم فولدر مميز للجروب
          });
        }
        throw new CustomError("Failed to create chat", 500);
      }

      return res
        .status(200)
        .json({ message: "success to create group chat", newChat });
    }
  };

  join_room = async (data: any, socket: SocketWithUser, io: Server) => {
    console.log({ data });
    const { roomId } = data;
    const chat = await this._chatModel.findOne({
      roomId,
      participants: { $in: [socket?.user?._id] },
      group: { $exists: true },
    });

    if (!chat) {
      throw new CustomError("chat not found", 404);
    }
    socket.join(chat?.roomId!);
    console.log({join:chat?.roomId});;
    
    // io.to(roomId).emit("join_room", {
    //   roomId,
    // });
  };
}
