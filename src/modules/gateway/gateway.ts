
import { Socket } from "socket.io";
import { IUser } from "../../DB/models/user.model";
import { HydratedDocument } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../../utils/classErrorHandling";
import { getsegnature, TokenType } from "../../utils/token";
import { decodedTokenAndfitchUser } from "../../utils/token";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { SocketWithUser } from "./gateway.interface";
import { ChatGateway } from "../chat/chat.gateway";


  export const connectionSocket = new Map<string, string[]>();




export const inilalizationIo = (httpServer:HttpServer) => {


//!initialization socket
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  //!middleware
  io.use(async (socket: SocketWithUser, next) => {
    try {
      const { authorization } = socket.handshake.auth;

      const [prefix, token] = authorization?.split(" ") || [];
      if (!prefix || !token) {
        throw next(new CustomError("Invalid authorization header format", 401));
      }

      const segnature = await getsegnature(TokenType.access, prefix);

      if (!segnature) {
        throw next(new CustomError("Invalid segnature not found", 401));
      }

      const { user, decoded } = await decodedTokenAndfitchUser(
        token,
        segnature
      );



  const socketIds= connectionSocket.get(user?._id.toString())||[]
  socketIds.push(socket.id)
      connectionSocket.set(user._id.toString(), socketIds);
      console.log(connectionSocket);
socket.user=user
socket.decoded=decoded
// console.log({ useeer:socket.user._id});
      next();
    } catch (error: any) {
      next(error);
    }
  });
 //!connection



 const chatGatewat:ChatGateway= new ChatGateway()
  io.on("connection", (socket: SocketWithUser) => {
    console.log("user connected ", socket.id);
    console.log(connectionSocket);
    socket.on("sendMessage", (data) => {
      
    })
chatGatewat.register(socket,io)

    //!disconnect
      socket.on("disconnect", (reason) => {
        let remainingTaps=connectionSocket.get(socket?.user?._id?.toString()!)
        remainingTaps=remainingTaps?.filter(id=>id!==socket.id)
        if(remainingTaps?.length){
          connectionSocket.set(socket?.user?._id?.toString()!,remainingTaps)
        }
        else{
          connectionSocket.delete(socket?.user?._id?.toString()!)
        }
    console.log("❌ User disconnected:", socket.id, "Reason:", reason);
   
    io.emit("userDisconnected", socket?.user?._id?.toString()!);
 
    });
    socket.on("hii", (data, callback) => {
      console.log(data)
      callback("hello from server-BE")
      });

        io.emit("offline_user", socket?.user?._id?.toString()!);
      console.log();
      
  });



};